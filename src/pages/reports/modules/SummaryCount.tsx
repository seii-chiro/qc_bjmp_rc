import { getSummary_Card, getUser, PaginatedResponse } from "@/lib/queries";
import { Visitor as NewVisitorType } from "@/lib/pdl-definitions";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
// import { Select } from "antd";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { BASE_URL } from "@/lib/urls";
import logoBase64 from "../assets/logoBase64";
pdfMake.vfs = pdfFonts.vfs;

// const { Option } = Select;

const SummaryCount = () => {
    const token = useTokenStore().token;
    const [selectedGroup, setSelectedGroup] = useState('All');
    const [organizationName, setOrganizationName] = useState('Bureau of Jail Management and Penology');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10); 

    const handleSelectChange = (value) => {
        setSelectedGroup(value);
    };

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    // const { data: visitorData } = useQuery({
    //     queryKey: ['visitor'],
    //     queryFn: () => getVisitor(token ?? "")
    // });

    const { data: visitorData } = useQuery({
        queryKey: ["allVisitor"],
        queryFn: async () => {
            const res = await fetch(`${BASE_URL}/api/visitors/visitor/?limit=10000`, {
                headers: {
                    Authorization: `Token ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!res.ok) throw new Error("Network error");
            return res.json();
        },
        enabled: !!token, 
    });



    const { data: UserData } = useQuery({
        queryKey: ['user'],
        queryFn: () => getUser(token ?? "")
    })

    const fetchOrganization = async () => {
        const res = await fetch(`${BASE_URL}/api/codes/organizations/`, {
            headers: {
                Authorization: `Token ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!res.ok) throw new Error("Network error");
        return res.json();
    };

    const { data: organizationData } = useQuery({
        queryKey: ['org'],
        queryFn: fetchOrganization,
    });

    useEffect(() => {
        if (organizationData?.results?.length > 0) {
            setOrganizationName(organizationData.results[0]?.org_name ?? '');
        }
    }, [organizationData]);


    //Visitor Type
    const seniorCitizenVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "Senior Citizen").length || 0;
    const regularVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "Regular").length || 0;
    const pwdVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "Person with Disabilities").length || 0;
    const pregnantWomanVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "Pregnant Woman").length || 0;
    const minorVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "Minor").length || 0;
    const lbtqVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "LGBTQ+").length || 0;
    const transgenderVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "LGBTQ + TRANSGENDER").length || 0;
    const lesbianVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "LGBTQ + LESBIAN / BISEXUAL").length || 0;
    const gayVisitorCount = visitorData?.results?.filter(visitor => visitor.visitor_type === "LGBTQ + GAY / BISEXUAL").length || 0;

    //Gender
    const maleCount = visitorData?.results?.filter(visitor => visitor.person?.gender?.gender_option === "Male").length || 0;
    const femaleCount = visitorData?.results?.filter(visitor => visitor.person?.gender?.gender_option === "Female").length || 0;
    const transgenderCount = visitorData?.results?.filter(visitor => visitor.person?.gender?.gender_option === "LGBTQ + TRANSGENDER").length || 0;
    const lesbianCount = visitorData?.results?.filter(visitor => visitor.person?.gender?.gender_option === "LGBTQ + LESBIAN / BISEXUAL").length || 0;
    const gayCount = visitorData?.results?.filter(visitor => visitor.person?.gender?.gender_option === "LGBTQ + GAY / BISEXUAL").length || 0;

    //RelatioshiptoPDL
    const uncleCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Uncle").length || 0;
    const auntCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Aunt").length || 0;
    const lawEnforcementInvestigatorCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Law Enforcement Investigator").length || 0;
    const authorizedPersonCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Authorized Person").length || 0;
    const authorizedVisitorCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Authorized Visitor").length || 0;
    const legalGuardianCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Legal Guardian").length || 0;
    const inLawCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "In-Law").length || 0;
    const lawyerCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Lawyer / Legal Counsel").length || 0;
    const clergyCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Clergy / Religious Leader").length || 0;
    const socialWorkerCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Social Worker").length || 0;
    const doctorCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Doctor / Medical Visitor").length || 0;
    const psychologistCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Psychologist").length || 0;
    const friendCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Friend").length || 0;
    const fianceCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Fiancé / Fiancée").length || 0;
    const domesticCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Domestic Partner").length || 0;
    const siblingCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Sibling").length || 0;
    const parentCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Parent").length || 0;
    const spouseCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Spouse").length || 0;
    const grandparentCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Grandparent").length || 0;
    const grandchildCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Grandchild").length || 0;
    const nephewCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Nephew").length || 0;
    const nieceCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Niece").length || 0;
    const cousinCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Cousin").length || 0;
    const neighborCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Neighbor").length || 0;
    const classmateCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Classmate / Schoolmate").length || 0;
    const formerColleagueCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Former Colleague").length || 0;
    const formerEmployerCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Former Employer").length || 0;
    const ngoCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "NGO Representative").length || 0;
    const governmentCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Government Representative").length || 0;
    const journalistCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Journalist / Media").length || 0;
    const unknownCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Unknown / To be Determined").length || 0;
    const childCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Child").length || 0;
    const brotherCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Brother").length || 0;
    const liveInCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Live-in Partner").length || 0;
    const brotherinLawCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Brother-in-law").length || 0;
    const motherCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Mother").length || 0;
    const motherinLawCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Mother-in-law").length || 0;
    const daughterCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Daughter").length || 0;
    const daughterinLawCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Daughter-in-law").length || 0;
    const nieceinLaw = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Niece-in-law").length || 0;
    const fatherCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Father").length || 0;
    const sisterCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Sister").length || 0;
    const sisterinLawCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Sister-in-law").length || 0;
    const sonCount = visitorData?.results?.filter(visitor => visitor.pdls?.[0]?.relationship_to_pdl === "Son").length || 0;

    const relationshipTotal =
    (auntCount ?? 0) +
    (lawEnforcementInvestigatorCount ?? 0) +
    (authorizedPersonCount ?? 0) +
    (lawyerCount ?? 0) +
    (authorizedVisitorCount ?? 0) +
    (legalGuardianCount ?? 0) +
    (brotherCount ?? 0) +
    (liveInCount ?? 0) +
    (childCount ?? 0) +
    (classmateCount ?? 0) +
    (neighborCount ?? 0) +
    (clergyCount ?? 0) +
    (nephewCount ?? 0) +
    (cousinCount ?? 0) +
    (ngoCount ?? 0) +
    (nieceCount ?? 0) +
    (doctorCount ?? 0) +
    (parentCount ?? 0) +
    (domesticCount ?? 0) +
    (psychologistCount ?? 0) +
    (siblingCount ?? 0) +
    (fianceCount ?? 0) +
    (formerColleagueCount ?? 0) +
    (formerEmployerCount ?? 0) +
    (socialWorkerCount ?? 0) +
    (friendCount ?? 0) +
    (spouseCount ?? 0) +
    (governmentCount ?? 0) +
    (grandchildCount ?? 0) +
    (grandparentCount ?? 0) +
    (uncleCount ?? 0) +
    (unknownCount ?? 0) +
    (inLawCount ?? 0) +
    (journalistCount ?? 0) +
    (brotherinLawCount ?? 0) +
    (motherCount ?? 0) +
    (motherinLawCount ?? 0) +
    (daughterCount ?? 0) +
    (daughterinLawCount ?? 0) +
    (nieceinLaw ?? 0) +
    (fatherCount ?? 0) +
    (sisterCount ?? 0) +
    (sisterinLawCount ?? 0) +
    (sonCount ?? 0);

    const exportVisitorTypeToExcel = ({
        seniorCitizenVisitorCount,
        regularVisitorCount,
        pwdVisitorCount,
        pregnantWomanVisitorCount,
        minorVisitorCount,
        lbtqVisitorCount,
        transgenderVisitorCount,
        lesbianVisitorCount,
        gayVisitorCount,
        maleCount,
        femaleCount,
        transgenderCount,
        lesbianCount,
        gayCount,

        auntCount,
        authorizedPersonCount,
        authorizedVisitorCount,
        brotherCount,
        brotherinLawCount,
        childCount,
        classmateCount,
        clergyCount,
        cousinCount,
        daughterCount,
        daughterinLawCount,
        doctorCount,
        domesticCount,
        fatherCount,
        fianceCount,
        formerColleagueCount,
        formerEmployerCount,
        friendCount,
        governmentCount,
        grandchildCount,
        grandparentCount,
        nephewCount,
        nieceCount,
        lawyerCount,
        legalGuardianCount,
        lawEnforcementInvestigatorCount,
        liveInCount,
        motherCount,
        motherinLawCount,
        neighborCount,
        ngoCount,
        psychologistCount,
        parentCount,
        socialWorkerCount,
        siblingCount,
        sisterCount,
        sisterinLawCount,
        sonCount,
        spouseCount,
        inLawCount,
        journalistCount,
        unknownCount,
        uncleCount,
        }: {
        seniorCitizenVisitorCount: number;
        regularVisitorCount: number;
        pwdVisitorCount: number;
        pregnantWomanVisitorCount: number;
        minorVisitorCount: number;
        lbtqVisitorCount: number;
        transgenderVisitorCount: number;
        lesbianVisitorCount: number;
        gayVisitorCount: number;
        maleCount: number;
        femaleCount: number;
        transgenderCount: number;
        lesbianCount: number;
        gayCount: number;

        auntCount: number;
        authorizedPersonCount: number;
        authorizedVisitorCount: number;
        brotherCount: number;
        brotherinLawCount: number;
        childCount: number;
        classmateCount: number;
        clergyCount: number;
        cousinCount: number;
        daughterCount: number;
        daughterinLawCount: number;
        doctorCount: number;
        domesticCount: number;
        fatherCount: number;
        fianceCount: number;
        formerColleagueCount: number;
        formerEmployerCount: number;
        friendCount: number;
        governmentCount: number;
        grandchildCount: number;
        grandparentCount: number;
        nephewCount: number;
        nieceCount: number;
        lawyerCount: number;
        legalGuardianCount: number;
        lawEnforcementInvestigatorCount: number;
        liveInCount: number;
        motherCount: number;
        motherinLawCount: number;
        neighborCount: number;
        ngoCount: number;
        psychologistCount: number;
        parentCount: number;
        socialWorkerCount: number;
        siblingCount: number;
        sisterCount: number;
        sisterinLawCount: number;
        sonCount: number;
        spouseCount: number;
        inLawCount: number;
        journalistCount: number;
        unknownCount: number;
        uncleCount: number;
        }) => {
        const visitorTypeData = [
            { "Visitor Type": "Senior Citizen", Total: seniorCitizenVisitorCount },
            { "Visitor Type": "Regular", Total: regularVisitorCount },
            { "Visitor Type": "PWD", Total: pwdVisitorCount },
            { "Visitor Type": "Pregnant Woman", Total: pregnantWomanVisitorCount },
            { "Visitor Type": "Minor", Total: minorVisitorCount },
            { "Visitor Type": "LGBTQ+", Total: lbtqVisitorCount },
            { "Visitor Type": "LGBTQ + TRANSGENDER", Total: transgenderVisitorCount },
            { "Visitor Type": "LGBTQ + LESBIAN / BISEXUAL", Total: lesbianVisitorCount },
            { "Visitor Type": "LGBTQ + GAY / BISEXUAL", Total: gayVisitorCount },
            {
            "Visitor Type": "Total",
            Total:
                seniorCitizenVisitorCount +
                regularVisitorCount +
                pwdVisitorCount +
                pregnantWomanVisitorCount +
                minorVisitorCount +
                lbtqVisitorCount +
                transgenderVisitorCount +
                lesbianVisitorCount +
                gayVisitorCount,
            },
        ];

        const genderData = [
            { Gender: "Male", Total: maleCount },
            { Gender: "Female", Total: femaleCount },
            { Gender: "LGBTQ + TRANSGENDER", Total: transgenderCount },
            { Gender: "LGBTQ + LESBIAN / BISEXUAL", Total: lesbianCount },
            { Gender: "LGBTQ + GAY / BISEXUAL", Total: gayCount },
            {
            Gender: "Total",
            Total: maleCount + femaleCount + transgenderCount + lesbianCount + gayCount,
            },
        ];

        const relationshipData = [
            { Relationship: "Auntie", Total: auntCount },
            { Relationship: "Authorized Person", Total: authorizedPersonCount },
            { Relationship: "Authorized Visitor", Total: authorizedVisitorCount },
            { Relationship: "Brother", Total: brotherCount },
            { Relationship: "Brother-in-law", Total: brotherinLawCount },
            { Relationship: "Child", Total: childCount },
            { Relationship: "Classmate / Schoolmate", Total: classmateCount },
            { Relationship: "Clergy / Religious Leader", Total: clergyCount },
            { Relationship: "Cousin", Total: cousinCount },
            { Relationship: "Daughter", Total: daughterCount },
            { Relationship: "Daughter-in-law", Total: daughterinLawCount },
            { Relationship: "Doctor / Medical Visitor", Total: doctorCount },
            { Relationship: "Domestic Partner", Total: domesticCount },
            { Relationship: "Father", Total: fatherCount },
            { Relationship: "Fiancé / Fiancée", Total: fianceCount },
            { Relationship: "Former Colleague", Total: formerColleagueCount },
            { Relationship: "Former Employer", Total: formerEmployerCount },
            { Relationship: "Friend", Total: friendCount },
            { Relationship: "Government Representative", Total: governmentCount },
            { Relationship: "Grandchild", Total: grandchildCount },
            { Relationship: "Grandparent", Total: grandparentCount },
            { Relationship: "Nephew", Total: nephewCount },
            { Relationship: "Niece", Total: nieceCount },
            { Relationship: "Lawyer / Legal Counsel", Total: lawyerCount },
            { Relationship: "Legal Guardian", Total: legalGuardianCount },
            { Relationship: "Law Enforcement Investigator", Total: lawEnforcementInvestigatorCount },
            { Relationship: "Live-in Partner", Total: liveInCount },
            { Relationship: "Mother", Total: motherCount },
            { Relationship: "Mother-in-law", Total: motherinLawCount },
            { Relationship: "Neighbor", Total: neighborCount },
            { Relationship: "NGO Representative", Total: ngoCount },
            { Relationship: "Psychologist", Total: psychologistCount },
            { Relationship: "Parent", Total: parentCount },
            { Relationship: "Social Worker", Total: socialWorkerCount },
            { Relationship: "Sibling", Total: siblingCount },
            { Relationship: "Sister", Total: sisterCount },
            { Relationship: "Sister-in-law", Total: sisterinLawCount },
            { Relationship: "Son", Total: sonCount },
            { Relationship: "Spouse", Total: spouseCount },
            { Relationship: "In-Law", Total: inLawCount },
            { Relationship: "Journalist / Media", Total: journalistCount },
            { Relationship: "Unknown / To be Determined", Total: unknownCount },
            { Relationship: "Uncle", Total: uncleCount },
            {
            Relationship: "Total",
            Total:
                auntCount +
                authorizedPersonCount +
                authorizedVisitorCount +
                brotherCount +
                brotherinLawCount +
                childCount +
                classmateCount +
                clergyCount +
                cousinCount +
                daughterCount +
                daughterinLawCount +
                doctorCount +
                domesticCount +
                fatherCount +
                fianceCount +
                formerColleagueCount +
                formerEmployerCount +
                friendCount +
                governmentCount +
                grandchildCount +
                grandparentCount +
                nephewCount +
                nieceCount +
                lawyerCount +
                legalGuardianCount +
                lawEnforcementInvestigatorCount +
                liveInCount +
                motherCount +
                motherinLawCount +
                neighborCount +
                ngoCount +
                psychologistCount +
                parentCount +
                socialWorkerCount +
                siblingCount +
                sisterCount +
                sisterinLawCount +
                sonCount +
                spouseCount +
                inLawCount +
                journalistCount +
                unknownCount +
                uncleCount,
            },
        ];

        const workbook = XLSX.utils.book_new();

        const visitorTypeSheet = XLSX.utils.json_to_sheet(visitorTypeData);
        XLSX.utils.book_append_sheet(workbook, visitorTypeSheet, "Visitor Type Summary");

        const genderSheet = XLSX.utils.json_to_sheet(genderData);
        XLSX.utils.book_append_sheet(workbook, genderSheet, "Gender Summary");

        const relationshipSheet = XLSX.utils.json_to_sheet(relationshipData);
        XLSX.utils.book_append_sheet(workbook, relationshipSheet, "Relationship to PDL Summary");

        XLSX.writeFile(workbook, "visitor_summary.xlsx");
    };

    const exportVisitorTypeToPDF = ({
    seniorCitizenVisitorCount,
    regularVisitorCount,
    pwdVisitorCount,
    pregnantWomanVisitorCount,
    minorVisitorCount,
    lbtqVisitorCount,
    transgenderVisitorCount,
    lesbianVisitorCount,
    gayVisitorCount,
    maleCount,
    femaleCount,
    transgenderCount,
    lesbianCount,
    gayCount,

    auntCount,
    authorizedPersonCount,
    authorizedVisitorCount,
    brotherCount,
    brotherinLawCount,
    childCount,
    classmateCount,
    clergyCount,
    cousinCount,
    daughterCount,
    daughterinLawCount,
    doctorCount,
    domesticCount,
    fatherCount,
    fianceCount,
    formerColleagueCount,
    formerEmployerCount,
    friendCount,
    governmentCount,
    grandchildCount,
    grandparentCount,
    nephewCount,
    nieceCount,
    lawyerCount,
    legalGuardianCount,
    lawEnforcementInvestigatorCount,
    liveInCount,
    motherCount,
    motherinLawCount,
    neighborCount,
    ngoCount,
    psychologistCount,
    parentCount,
    socialWorkerCount,
    siblingCount,
    sisterCount,
    sisterinLawCount,
    sonCount,
    spouseCount,
    inLawCount,
    journalistCount,
    unknownCount,
    uncleCount,
    }: {
    seniorCitizenVisitorCount: number;
    regularVisitorCount: number;
    pwdVisitorCount: number;
    pregnantWomanVisitorCount: number;
    minorVisitorCount: number;
    lbtqVisitorCount: number;
    transgenderVisitorCount: number;
    lesbianVisitorCount: number;
    gayVisitorCount: number;
    maleCount: number;
    femaleCount: number;
    transgenderCount: number;
    lesbianCount: number;
    gayCount: number;

    auntCount: number;
    authorizedPersonCount: number;
    authorizedVisitorCount: number;
    brotherCount: number;
    brotherinLawCount: number;
    childCount: number;
    classmateCount: number;
    clergyCount: number;
    cousinCount: number;
    daughterCount: number;
    daughterinLawCount: number;
    doctorCount: number;
    domesticCount: number;
    fatherCount: number;
    fianceCount: number;
    formerColleagueCount: number;
    formerEmployerCount: number;
    friendCount: number;
    governmentCount: number;
    grandchildCount: number;
    grandparentCount: number;
    nephewCount: number;
    nieceCount: number;
    lawyerCount: number;
    legalGuardianCount: number;
    lawEnforcementInvestigatorCount: number;
    liveInCount: number;
    motherCount: number;
    motherinLawCount: number;
    neighborCount: number;
    ngoCount: number;
    psychologistCount: number;
    parentCount: number;
    socialWorkerCount: number;
    siblingCount: number;
    sisterCount: number;
    sisterinLawCount: number;
    sonCount: number;
    spouseCount: number;
    inLawCount: number;
    journalistCount: number;
    unknownCount: number;
    uncleCount: number;
    }) => {
    const visitorTypeData = [
        { "Visitor Type": "Senior Citizen", Total: seniorCitizenVisitorCount },
        { "Visitor Type": "Regular", Total: regularVisitorCount },
        { "Visitor Type": "PWD", Total: pwdVisitorCount },
        { "Visitor Type": "Pregnant Woman", Total: pregnantWomanVisitorCount },
        { "Visitor Type": "Minor", Total: minorVisitorCount },
        { "Visitor Type": "LGBTQ+", Total: lbtqVisitorCount },
        { "Visitor Type": "LGBTQ + TRANSGENDER", Total: transgenderVisitorCount },
        { "Visitor Type": "LGBTQ + LESBIAN / BISEXUAL", Total: lesbianVisitorCount },
        { "Visitor Type": "LGBTQ + GAY / BISEXUAL", Total: gayVisitorCount },
        {
        "Visitor Type": "Total",
        Total:
            seniorCitizenVisitorCount +
            regularVisitorCount +
            pwdVisitorCount +
            pregnantWomanVisitorCount +
            minorVisitorCount +
            lbtqVisitorCount +
            transgenderVisitorCount +
            lesbianVisitorCount +
            gayVisitorCount,
        },
    ];

    const genderData = [
        { Gender: "Male", Total: maleCount },
        { Gender: "Female", Total: femaleCount },
        { Gender: "LGBTQ + TRANSGENDER", Total: transgenderCount },
        { Gender: "LGBTQ + LESBIAN / BISEXUAL", Total: lesbianCount },
        { Gender: "LGBTQ + GAY / BISEXUAL", Total: gayCount },
        {
        Gender: "Total",
        Total: maleCount + femaleCount + transgenderCount + lesbianCount + gayCount,
        },
    ];

    const relationshipData = [
        { Relationship: "Auntie", Total: auntCount },
        { Relationship: "Authorized Person", Total: authorizedPersonCount },
        { Relationship: "Authorized Visitor", Total: authorizedVisitorCount },
        { Relationship: "Brother", Total: brotherCount },
        { Relationship: "Brother-in-law", Total: brotherinLawCount },
        { Relationship: "Child", Total: childCount },
        { Relationship: "Classmate / Schoolmate", Total: classmateCount },
        { Relationship: "Clergy / Religious Leader", Total: clergyCount },
        { Relationship: "Cousin", Total: cousinCount },
        { Relationship: "Daughter", Total: daughterCount },
        { Relationship: "Daughter-in-law", Total: daughterinLawCount },
        { Relationship: "Doctor / Medical Visitor", Total: doctorCount },
        { Relationship: "Domestic Partner", Total: domesticCount },
        { Relationship: "Father", Total: fatherCount },
        { Relationship: "Fiancé / Fiancée", Total: fianceCount },
        { Relationship: "Former Colleague", Total: formerColleagueCount },
        { Relationship: "Former Employer", Total: formerEmployerCount },
        { Relationship: "Friend", Total: friendCount },
        { Relationship: "Government Representative", Total: governmentCount },
        { Relationship: "Grandchild", Total: grandchildCount },
        { Relationship: "Grandparent", Total: grandparentCount },
        { Relationship: "Nephew", Total: nephewCount },
        { Relationship: "Niece", Total: nieceCount },
        { Relationship: "Lawyer / Legal Counsel", Total: lawyerCount },
        { Relationship: "Legal Guardian", Total: legalGuardianCount },
        { Relationship: "Law Enforcement Investigator", Total: lawEnforcementInvestigatorCount },
        { Relationship: "Live-in Partner", Total: liveInCount },
        { Relationship: "Mother", Total: motherCount },
        { Relationship: "Mother-in-law", Total: motherinLawCount },
        { Relationship: "Neighbor", Total: neighborCount },
        { Relationship: "NGO Representative", Total: ngoCount },
        { Relationship: "Psychologist", Total: psychologistCount },
        { Relationship: "Parent", Total: parentCount },
        { Relationship: "Social Worker", Total: socialWorkerCount },
        { Relationship: "Sibling", Total: siblingCount },
        { Relationship: "Sister", Total: sisterCount },
        { Relationship: "Sister-in-law", Total: sisterinLawCount },
        { Relationship: "Son", Total: sonCount },
        { Relationship: "Spouse", Total: spouseCount },
        { Relationship: "In-Law", Total: inLawCount },
        { Relationship: "Journalist / Media", Total: journalistCount },
        { Relationship: "Unknown / To be Determined", Total: unknownCount },
        { Relationship: "Uncle", Total: uncleCount },
        {
        Relationship: "Total",
        Total:
            auntCount +
            authorizedPersonCount +
            authorizedVisitorCount +
            brotherCount +
            brotherinLawCount +
            childCount +
            classmateCount +
            clergyCount +
            cousinCount +
            daughterCount +
            daughterinLawCount +
            doctorCount +
            domesticCount +
            fatherCount +
            fianceCount +
            formerColleagueCount +
            formerEmployerCount +
            friendCount +
            governmentCount +
            grandchildCount +
            grandparentCount +
            nephewCount +
            nieceCount +
            lawyerCount +
            legalGuardianCount +
            lawEnforcementInvestigatorCount +
            liveInCount +
            motherCount +
            motherinLawCount +
            neighborCount +
            ngoCount +
            psychologistCount +
            parentCount +
            socialWorkerCount +
            siblingCount +
            sisterCount +
            sisterinLawCount +
            sonCount +
            spouseCount +
            inLawCount +
            journalistCount +
            unknownCount +
            uncleCount,
        },
    ];
    const preparedByText = UserData ? `${UserData.first_name} ${UserData.last_name}` : '';
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        const reportReferenceNo = `TAL-${formattedDate}-XXX`;
        
    const buildTable = (title: string, data: any[], columns: [string, string]) => {
        
        const [col1, col2] = columns;

        return [
        { text: title, style: "sectionHeader", margin: [0, 10, 0, 5] },
        {
            table: {
            widths: ["*", "auto"],
            headerRows: 1,
            body: [
                [
                { text: col1, style: "tableHeader" },
                { text: col2, style: "tableHeader" },
                ],
                ...data.map((item) => [item[col1], item[col2]]),
            ],
            },
            layout: {
                    fillColor: (rowIndex) => (rowIndex === 0 ? '#DCE6F1' : null),
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    hLineColor: () => '#aaa',
                    vLineColor: () => '#aaa',
                    paddingLeft: () => 4,
                    paddingRight: () => 4,
                },
                fontSize: 11,
        },
        ];
    };

    const docDefinition = {
        pageSize: "A4",
        pageOrientation: "portrait",
        pageMargins: [40, 60, 40, 60],
        content: [
        {
            text: 'Visitor Summary Report',
            style: 'header',
            alignment: 'left',
            margin: [0, 0, 0, 10],
        },
        {
                    columns: [
                        {
                            stack: [
                                {
                                    text: organizationName,
                                    style: 'subheader',
                                    margin: [0, 5, 0, 10],
                                },
                                {
                                    text: [
                                        { text: `Report Date: `, bold: true },
                                        formattedDate + '\n',
                                        { text: `Prepared By: `, bold: true },
                                        preparedByText + '\n',
                                        { text: `Department/Unit: `, bold: true },
                                        'IT\n',
                                        { text: `Report Reference No.: `, bold: true },
                                        reportReferenceNo,
                                    ],
                                    fontSize: 10,
                                },
                            ],
                            alignment: 'left',
                            width: '70%',
                        },
                        {
                            stack: [
                                {
                                    image: logoBase64,
                                    width: 90,
                                },
                            ],
                            alignment: 'right',
                            width: '30%',
                        },
                    ],
                    margin: [0, 0, 0, 10],
                },
        ...buildTable("Visitor Type Summary", visitorTypeData, ["Visitor Type", "Total"]),
        ...buildTable("Gender Summary", genderData, ["Gender", "Total"]),
        ...buildTable("Relationship to PDL Summary", relationshipData, ["Relationship", "Total"]),
        ],
        footer: (currentPage: number, pageCount: number) => ({
                    columns: [
                        {
                            text: `Document Version: 1.0\nConfidentiality Level: Internal use only\nContact Info: ${preparedByText}\nTimestamp of Last Update: ${formattedDate}`,
                            fontSize: 8,
                            alignment: 'left',
                            margin: [40, 10],
                        },
                        {
                            text: `${currentPage} / ${pageCount}`,
                            fontSize: 8,
                            alignment: 'right',
                            margin: [0, 10, 40, 0],
                        },
                    ],
                }),
        styles: {
            title: {
                fontSize: 16,
                bold: true,
                alignment: "center",
                margin: [0, 0, 0, 10],
            },
            header: {
                fontSize: 13,
                bold: true,
                margin: [0, 10, 0, 5],
            },
            subheader: {
                fontSize: 12,
                bold: true,
                margin: [0, 10, 0, 5],
                color: "#1E365D",
            },
        },
    };

    pdfMake.createPdf(docDefinition).download("visitor_summary.pdf");
    };

    return (
        <div className="px-5 py-5 md:mx-auto">
            <h1 className="text-xl font-bold text-[#1E365D]">Summary Count of PDL Visitor</h1>
            <div className="flex items-center justify-between mt-5">
                <div className="border border-gray-100 rounded-md flex flex-col gap-2 p-5 w-80">
                    <h1 className="font-semibold">Total Count of PDL Visitors</h1>
                    <div className="font-extrabold text-2xl flex ml-auto text-[#1E365D]">
                        {summarydata?.success?.person_count_by_status?.Visitor?.Active ?? 0}
                    </div>
                </div>{/* <Select className="w-80 h-10" onChange={handleSelectChange} value={selectedGroup}>
                        <Option value="All">All</Option>
                        <Option value="Visitor Type">Visitor Type</Option>
                        <Option value="Gender">Gender</Option>
                        <Option value="Relationship to PDL">Relationship to PDL</Option>
                    </Select> */}
                <div>
                    <button
                        onClick={() =>
                        exportVisitorTypeToExcel({
                            seniorCitizenVisitorCount,
                            regularVisitorCount,
                            pwdVisitorCount,
                            pregnantWomanVisitorCount,
                            minorVisitorCount,
                            lbtqVisitorCount,
                            transgenderVisitorCount,
                            lesbianVisitorCount,
                            gayVisitorCount,
                            maleCount,
                            femaleCount,
                            transgenderCount,
                            lesbianCount,
                            gayCount,
                            auntCount,
                            authorizedPersonCount,
                            authorizedVisitorCount,
                            brotherCount,
                            brotherinLawCount,
                            childCount,
                            classmateCount,
                            clergyCount,
                            cousinCount,
                            daughterCount,
                            daughterinLawCount,
                            doctorCount,
                            domesticCount,
                            fatherCount,
                            fianceCount,
                            formerColleagueCount,
                            formerEmployerCount,
                            friendCount,
                            governmentCount,
                            grandchildCount,
                            grandparentCount,
                            nephewCount,
                            nieceCount,
                            lawyerCount,
                            legalGuardianCount,
                            lawEnforcementInvestigatorCount,
                            liveInCount,
                            motherCount,
                            motherinLawCount,
                            neighborCount,
                            ngoCount,
                            psychologistCount,
                            parentCount,
                            socialWorkerCount,
                            siblingCount,
                            sisterCount,
                            sisterinLawCount,
                            sonCount,
                            spouseCount,
                            inLawCount,
                            journalistCount,
                            unknownCount,
                            uncleCount,
                        })
                        }
                        className="bg-[#1E365D] text-white px-4 py-2 rounded mr-4"
                    >
                        Export to Excel
                    </button>
                    <button
                        onClick={() =>
                        exportVisitorTypeToPDF({
                            seniorCitizenVisitorCount,
                            regularVisitorCount,
                            pwdVisitorCount,
                            pregnantWomanVisitorCount,
                            minorVisitorCount,
                            lbtqVisitorCount,
                            transgenderVisitorCount,
                            lesbianVisitorCount,
                            gayVisitorCount,
                            maleCount,
                            femaleCount,
                            transgenderCount,
                            lesbianCount,
                            gayCount,
                            auntCount,
                            authorizedPersonCount,
                            authorizedVisitorCount,
                            brotherCount,
                            brotherinLawCount,
                            childCount,
                            classmateCount,
                            clergyCount,
                            cousinCount,
                            daughterCount,
                            daughterinLawCount,
                            doctorCount,
                            domesticCount,
                            fatherCount,
                            fianceCount,
                            formerColleagueCount,
                            formerEmployerCount,
                            friendCount,
                            governmentCount,
                            grandchildCount,
                            grandparentCount,
                            nephewCount,
                            nieceCount,
                            lawyerCount,
                            legalGuardianCount,
                            lawEnforcementInvestigatorCount,
                            liveInCount,
                            motherCount,
                            motherinLawCount,
                            neighborCount,
                            ngoCount,
                            psychologistCount,
                            parentCount,
                            socialWorkerCount,
                            siblingCount,
                            sisterCount,
                            sisterinLawCount,
                            sonCount,
                            spouseCount,
                            inLawCount,
                            journalistCount,
                            unknownCount,
                            uncleCount,
                        })
                        }
                        className="bg-[#1E365D] text-white px-4 py-2 rounded"
                    >
                        Export to PDF
                    </button>
                </div>
            </div>
            <div className=" mt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-20">
                    <div className="flex col-span-1 flex-col gap-5">
                        {selectedGroup === 'All' || selectedGroup === 'Visitor Type' ? (
                        <div>
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Visitor Count Based on their Visitor Type</h1>
                            <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Visitor Type</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Senior Citizen</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{seniorCitizenVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Regular</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{regularVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">PWD</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{pwdVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Pregnant Woman</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{pregnantWomanVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Minor</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{minorVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ+</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{lbtqVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + TRANSGENDER</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{transgenderVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + LESBIAN / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{lesbianVisitorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + GAY / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{gayVisitorCount}</td>
                                        </tr>
                                        <tr className="w-full border-t-2 border-gray-[#1E365D] h-1">
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">Total</td>
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">{seniorCitizenVisitorCount + regularVisitorCount + pwdVisitorCount + pregnantWomanVisitorCount + minorVisitorCount + lbtqVisitorCount + transgenderVisitorCount + lesbianVisitorCount + gayVisitorCount}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ) : null}
                        {selectedGroup === 'All' || selectedGroup === 'Gender' ? (
                        <div>
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Visitor Count Based on their Gender</h1>
                            <div className="overflow-hidden rounded-lg border border-gray-200 mt-2">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Male</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{maleCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">Female</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{femaleCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + TRANSGENDER</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{transgenderCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + LESBIAN / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{lesbianCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-2 whitespace-nowrap">LGBTQ + GAY / BISEXUAL</td>
                                            <td className="px-6 py-2 whitespace-nowrap">{gayCount}</td>
                                        </tr>
                                        <tr className="w-full border-t-2 border-gray-[#1E365D] h-1">
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">Total</td>
                                            <td className="px-6 py-2 font-bold whitespace-nowrap">{maleCount + femaleCount + transgenderCount + lesbianCount + gayCount}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        ) : null}
                    </div>
                    {selectedGroup === 'All' || selectedGroup === 'Relationship to PDL' ? (
                    <div className="flex col-span-2 flex-col gap-5">
                        <div>
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Relationship to PDL</h1>
                            <div className="overflow-hidden rounded-lg border border-gray-200 mt-2 overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 ">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Relationship to PDL</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Relationship to PDL</th>
                                            <th className="px-6 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Auntie</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{auntCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Law Enforcement Investigator</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{lawEnforcementInvestigatorCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Authorized Person</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{authorizedPersonCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Lawyer / Legal Counsel</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{lawyerCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Authorized Visitor</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{authorizedVisitorCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Legal Guardian</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{legalGuardianCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Brother</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{brotherCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Live-in Partner</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{liveInCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Brother-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{brotherinLawCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Mother</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{motherCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Child</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{childCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Mother-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{motherinLawCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Classmate / Schoolmate</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{classmateCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Neighbor</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{neighborCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Clergy / Religious Leader</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{clergyCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Nephew</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{nephewCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Cousin</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{cousinCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">NGO Representative</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{ngoCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Daughter</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{daughterCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Niece</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{nieceCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Daughter-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{daughterinLawCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Niece-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{nieceinLaw}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Doctor / Medical Visitor</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{doctorCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Parent</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{parentCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Domestic Partner</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{domesticCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Psychologist</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{psychologistCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Father</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{fatherCount}</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Sibling</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{siblingCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Fiancé / Fiancée</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{fianceCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Sister</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{sisterCount}</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Former Colleague</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{formerColleagueCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Sister-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{sisterinLawCount}</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Former Employer</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{formerEmployerCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Social Worker</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{socialWorkerCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Friend</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{friendCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Son</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{sonCount}</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Goddaughter</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Son-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Godsister</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Spouse</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{spouseCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Government Representative</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{governmentCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Stepbrother</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Grandchild</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{grandchildCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Stepdaughter</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Granddaughter</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Stepfather</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Grandfather</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Stepmother</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Grandmother</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Stepsister</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Grandparent</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{grandparentCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Stepson</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Grandson</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Uncle</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{uncleCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Husband</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Unknown / To be Determined</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{unknownCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">In-Law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{inLawCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Wife</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Journalist / Media</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{journalistCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l"></td>
                                            <td className="px-6 py-1 whitespace-nowrap"></td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap"></td>
                                            <td className="px-6 py-1 whitespace-nowrap"></td>
                                            <td className="px-6 py-1 whitespace-nowrap font-bold">Total</td>
                                            <td className="px-6 py-1 whitespace-nowrap font-bold">{relationshipTotal}</td>
                                        </tr>
                                        {/*  +  + seniorCitizenVisitorCount +  +  +authorizedPersonCount  +pwdVisitorCount pregnantWomanVisitorCount + minorVisitorCount + lbtqVisitorCount + transgenderCount + lesbianCount + gayCount + maleCount + femaleCount + transgenderVisitorCount + lesbianVisitorCount + gayVisitorCount + uncleCount + lawEnforcementInvestigatorCount + legalGuardianCount + inLawCount + lawyerCount + clergyCount + socialWorkerCount + doctorCount + psychologistCount + friendCount + fianceCount + domesticCount + siblingCount + parentCount + spouseCount + grandchildCount + grandparentCount + nephewCount + nieceCount + cousinCount + neighborCount + classmateCount + formerColleagueCount +formerEmployerCount + ngoCount + governmentCount + journalistCount + unknownCount + childCount + brotherCount + liveInCount */}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    ) : null}
                </div>
            </div>
        </div>
    )
}

export default SummaryCount
