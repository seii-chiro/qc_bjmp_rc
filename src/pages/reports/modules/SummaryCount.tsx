import { getSummary_Card } from "@/lib/queries";
import { getVisitor } from "@/lib/query";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Select } from "antd";
import { useState } from "react";

const { Option } = Select;

const SummaryCount = () => {
    const token = useTokenStore().token;
    const [selectedGroup, setSelectedGroup] = useState('All');

    const handleSelectChange = (value) => {
        setSelectedGroup(value);
    };

    const { data: summarydata } = useQuery({
        queryKey: ['summary-card'],
        queryFn: () => getSummary_Card(token ?? "")
    });

    const { data: visitorData } = useQuery({
        queryKey: ['visitor'],
        queryFn: () => getVisitor(token ?? "")
    });

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

    return (
        <div className="px-5 py-5 md:mx-auto">
            <h1 className="text-xl font-bold text-[#1E365D]">Summary Count of PDL Visitor</h1>
            <div className="flex flex-coljustify-between mt-5">
                <div>
                    <Select className="w-80 h-10" onChange={handleSelectChange} value={selectedGroup}>
                        <Option value="All">All</Option>
                        <Option value="Visitor Type">Visitor Type</Option>
                        <Option value="Gender">Gender</Option>
                        <Option value="Relationship to PDL">Relationship to PDL</Option>
                    </Select>
                </div>
                {/* <div>
                    <h1>Total Count of PDL Visitors</h1>
                    <div className="">
                        {summarydata?.success?.person_count_by_status?.Visitor?.Active}
                    </div>
                    
                </div> */}
            </div>
            <div className=" mt-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-20">
                    <div className="flex col-span-1 flex-col gap-5">
                        {selectedGroup === 'All' || selectedGroup === 'Visitor Type' ? (
                        <div>
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'>Visitor Type</h1>
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
                            <h1 className='px-2 font-semibold text-lg text-[#1E365D]'> Gender</h1>
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
                                            <td className="px-6 py-1 whitespace-nowrap">0</td> {/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Mother</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{0}</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Child</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{childCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Mother-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{0}</td>{/* -------------------- */}
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
                                            <td className="px-6 py-1 whitespace-nowrap">{0}</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Niece</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{nieceCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Daughter-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Niece-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
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
                                            <td className="px-6 py-1 whitespace-nowrap">{0}</td>{/* -------------------- */}
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Sibling</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{siblingCount}</td>
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Fiancé / Fiancée</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{fianceCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Sister</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
                                        </tr>
                                        <tr>
                                            <td className="px-6 py-1 whitespace-nowrap">Former Colleague</td>
                                            <td className="px-6 py-1 whitespace-nowrap">{formerColleagueCount}</td>
                                            <td className="px-6 py-1 whitespace-nowrap border-l">Sister-in-law</td>
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
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
                                            <td className="px-6 py-1 whitespace-nowrap">0</td>{/* -------------------- */}
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
                                            <td className="px-6 py-1 whitespace-nowrap font-bold">{nephewCount + parentCount + siblingCount + spouseCount + uncleCount + auntCount + regularVisitorCount }</td>
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
