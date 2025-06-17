/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import React, { Suspense, useEffect } from "react";
import Spinner from "./components/loaders/Spinner.tsx";
import GeneralErrorElement from "./pages/error_pages/GeneralErrorElement.tsx";
import { useAuthStore } from "./store/useAuthStore.ts";
import { MapContent } from "./map/MapContent.tsx";
import Landing from "./pages/landing/Home.tsx";
import Assets from "./pages/assets/assets.tsx";
import JailFacility from "./pages/assets/jail-facility/jailfacility.tsx";
import JailArea from "./pages/facility_management/Jail-Area/jailarea.tsx";
import JailType from "./pages/facility_management/Jail-Type/Jail_Type.tsx";
import JailCategory from "./pages/facility_management/Jail-Category/jailcategory.tsx";
import JailSecurityLevel from "./pages/facility_management/jail-security-level/Jailsecuritylevel.tsx";
import Device from "./pages/devices-management/devices/Devices.tsx";
import DeviceType from "./pages/devices-management/devices-type/DevicesType.tsx";
import DeviceUsage from "./pages/devices-management/devices-usage/devicesusage.tsx";
import Maintenance from "./pages/maintenance/maintenance.tsx";
import RecordStatus from "./pages/maintenance/record_status/recordstatus.tsx";
import SocialMedia from "./pages/maintenance/social_media_platform/socialmedia.tsx";
import Gender from "./pages/personnel_management/gender/gender.tsx";
import CivilStatus from "./pages/personnel_management/civil-status/civilstatus.tsx";
import ID_Types from "./pages/personnel_management/ID_type/idtype.tsx";
import User from "./pages/User_Management/User.tsx";
import Users from "./pages/User_Management/User/User.tsx";
import Roles from "./pages/User_Management/Roles/Roles.tsx";
import Tools from "./pages/tools/Tools.tsx";
import Integration from "./pages/Integration/Integration.tsx";
import Support from "./pages/support/Support.tsx";
import Incidents from "./pages/Incidents/Incidents.tsx";
import Threat from "./pages/threat/Threat.tsx";
import Screening from "./pages/screening/Screening.tsx";
import PDL from "./pages/pdl_management/PDL.tsx";
import Visitors from "./pages/visitor_management/visitors.tsx";
import VisitorType from "./pages/visitor_management/visitor-type/visitortype.tsx";
import VisitorReqDocs from "./pages/visitor_management/visitor_requirement_docs/visitorreqdocs.tsx";
import VisitorRelationship from "./pages/visitor_management/visitor_relationship/visitor_relationship.tsx";
import Rank from "./pages/personnel_management/rank/rank.tsx";
import Position from "./pages/personnel_management/position/position.tsx";
import EmploymentType from "./pages/personnel_management/employment_type/EmploymentType.tsx";
import AffiliationType from "./pages/personnel_management/affiliation-type/AffiliationType.tsx";
import Home1 from "./pages/home/Home.tsx";
import Personnels from "./pages/personnel_management/Personnel.tsx";
import Personnel from "./pages/personnel_management/personnel/personnel.tsx";
import Home2 from "./pages/home/Home2/Home.tsx";
import Database from "./pages/database/database.tsx";
import VisitorRegistration from "./pages/visitor_management/visitor-data-entry/visitorregistration.tsx";
import Dashboard from "./pages/dashboard/Dashboard.tsx";
import VisitorCodeIdentification from "./pages/visitor_management/VisitorCodeIdentification.tsx";
import Visitor from "./pages/visitor_management/visitor.tsx";
import Skills from "./pages/pdl_management/Skills/Skills.tsx";
import Talents from "./pages/pdl_management/Talents/Talents.tsx";
import Religion from "./pages/maintenance/Religion/Religion.tsx";
import Court from "./pages/database/JudicialCourt/Court.tsx";
import Interest from "./pages/database/Interest/Interest.tsx";
import Looks from "./pages/pdl_management/Look/look.tsx";
import Registration from "./pages/Registration/registration.tsx";
import LogMonitoring from "./pages/LOG/LogMonitoring.tsx";
import VisitLog from "./pages/LOG/Visit-Log/VisitLog.tsx";
import CourtBranch from "./pages/pdl_management/Court-Branch/CourtBranch.tsx";
import Occupation from "./pages/maintenance/Occupation/Occupation.tsx";
import EducationalAttainment from "./pages/maintenance/Educational-Attainment/EducationalAttainment.tsx";
import Prefixes from "./pages/maintenance/Prefixes/Prefixes.tsx";
import Suffixes from "./pages/maintenance/Suffixes/Suffixes.tsx";
import ContactType from "./pages/maintenance/Contact/contact.tsx";
import AddressType from "./pages/maintenance/Address/AddressType.tsx";
import Nationality from "./pages/maintenance/Nationality/Nationality.tsx";
import BJMPPersonnel from "./pages/Registration/BJMPPersonnel/BJMPPersonnel.tsx";
import MultiBirth from "./pages/maintenance/Multi-Birth/MultiBirth.tsx";
import PdlRegistration from "./pages/visitor_management/pdl-data-entry/PdlRegistration.tsx";
import PersonnelRegistration from "./pages/visitor_management/personnel-data-entry/PersonnelRegistration.tsx";
import NonPdlVisitorRegistration from "./pages/visitor_management/non-pdl-visitor-data-entry/NonPdlVisitorRegistration.tsx";
import ServiceProviderRegistration from "./pages/visitor_management/service-provider-data-entry/ServiceProviderRegistration.tsx";
import IssueType from "./pages/visitor_management/Issues/Issue-Type/IssueType.tsx";
import IssueCategory from "./pages/visitor_management/Issues/Issue-Category/IssueCategory.tsx";
import Risk from "./pages/visitor_management/Issues/Risk/Risk.tsx";
import RiskLevel from "./pages/visitor_management/Issues/Risk_Level/RiskLevel.tsx";
import Impact from "./pages/visitor_management/Issues/Impact/Impact.tsx";
import ImpactLevel from "./pages/visitor_management/Issues/Impact-Level/ImpactLevel.tsx";
import RecommendedAction from "./pages/visitor_management/Issues/recommended/RecommendedAction.tsx";
import Issues from "./pages/visitor_management/Issues/issues.tsx";
import GangAffiliation from "./pages/pdl_management/Gang/GangAffiliation.tsx";
import Precinct from "./pages/pdl_management/Police-Precinct/Precinct.tsx";
import Offenses from "./pages/pdl_management/Offenses/Offenses.tsx";
import Law from "./pages/pdl_management/Laws/Law.tsx";
import CrimeCategory from "./pages/pdl_management/Crime-Category/CrimeCategory.tsx";
import Ethnicity from "./pages/maintenance/ethnicity/Ethnicity.tsx";
import Relationship from "./pages/pdl_management/Relationship/Relationship.tsx";
import PDLtable from "./pages/pdl_management/pdl-information/PDLs.tsx";
import PDLVisitors from "./pages/LOG/PDLVisitor/PDLVisitors.tsx";
import VisitorProfileSlider from "./pages/LOG/visitor-profiles/VisitorProfileSlider.tsx";
import Verify from "./pages/screening/verify/Verify.tsx";
import OTP from "./pages/User_Management/OTP/OTP.tsx";
import LoginOTP from "./pages/LoginOTP.tsx";
import UpdatePDL from "./pages/pdl_management/pdl-information/UpdatePDL.tsx";
import PersonnelUpdate from "./pages/personnel_management/personnel/PersonnelUpdate.tsx";
import NonPDL from "./pages/Non-PDL/NonPDL.tsx";
import ServiceProvider from "./pages/service-provider/ServiceProvider.tsx";
import EditVisitor from "./pages/visitor_management/edit-visitor/EditVisitor.tsx";
import Person from "./pages/visitor_management/person/actual-person/ActualPersonTable.tsx";
import Error from "./pages/Error.tsx";
import VisitorID from "./pages/visitor_management/VisitorID.tsx";
import ReportAnIncident from "@/pages/Incidents/Report.tsx"
import IncidentTable from "./pages/Incidents/IncidentTable.tsx";
import DeviceSetting from "./pages/devices-management/device-setting/DeviceSetting.tsx";
import AddWatchlist from "./pages/threat/AddWatchlist.tsx";
import Watchlist from "./pages/threat/Watchlist.tsx";
import Alphalist from "./pages/alphalist/Alphalist.tsx";
import Level from "./pages/assets/level/Level.tsx";
import Annex from "./pages/assets/annex/Annex.tsx";
import Dorm from "./pages/assets/dorm/Dorm.tsx";
import GroupAffiliation from "./pages/maintenance/group-affiliation/GroupAffiliation.tsx";
import IncidentCategory from "./pages/Incidents/incident-category/IncidentCategory.tsx";
import IncidentType from "./pages/Incidents/incident-type/IncidentType.tsx";
import Settings from "./pages/Settings/Settings.tsx";
import GeneralSettings from "./pages/Settings/general-setting/GeneralSettings.tsx";
import SystemSettings from "./pages/Settings/system-settings/SystemSettings.tsx";
import { useSystemSettingsStore } from "@/store/useSystemSettingStore.ts";
import { useTokenStore } from "./store/useTokenStore.ts";
import OasisAlertForm from "./pages/oasis/OasisAlertForm.tsx";
import MainReport from "./pages/reports/MainReport.tsx";
import DashboardSummary from "./pages/reports/modules/DashboardSummary.tsx";
import SummaryCount from "./pages/reports/modules/SummaryCount.tsx";
import SummaryCountofPDLs from "./pages/reports/modules/SummaryCountofPDLs.tsx";
import SummaryCountofPersonnel from "./pages/reports/modules/SummaryCountofPersonnel.tsx";
import ListPDLVisitors from "./pages/reports/modules/lists/ListPDLVisitors.tsx";
import ListPersonnel from "./pages/reports/modules/lists/ListPersonnel.tsx";
import ListPDLs from "./pages/reports/modules/lists/ListPDLs.tsx";
import Statuses from "./pages/oasis/maintenance/Statuses.tsx";
import MessageTypes from "./pages/oasis/maintenance/MessageTypes.tsx";
import Scopes from "./pages/oasis/maintenance/Scopes.tsx";
import Restrictions from "./pages/oasis/maintenance/Restrictions.tsx";
import Codes from "./pages/oasis/maintenance/Codes.tsx";
import Notes from "./pages/oasis/maintenance/Notes.tsx";
import Language from "./pages/oasis/maintenance/Language.tsx";
import Categories from "./pages/oasis/maintenance/Categories.tsx";
import Events from "./pages/oasis/maintenance/Events.tsx";
import ResponseTypes from "./pages/oasis/maintenance/ResponseTypes.tsx";
import Urgency from "./pages/oasis/maintenance/Urgency.tsx";
import Severity from "./pages/oasis/maintenance/Severity.tsx";
import Certainty from "./pages/oasis/maintenance/Certainty.tsx";
import Audience from "./pages/oasis/maintenance/Audience.tsx";
import EventCodes from "./pages/oasis/maintenance/EventCodes.tsx";
import Instructions from "./pages/oasis/maintenance/Instructions.tsx";
import Parameter from "./pages/oasis/maintenance/Parameter.tsx";
import PersonnelDesignation from "./pages/personnel_management/personnel-designation/PersonnelDesignation.tsx";
import PersonnelStatus from "./pages/personnel_management/personnel-status/PersonnelStatus.tsx";
import PersonnelType from "./pages/personnel_management/personnel-type/PersonnelType.tsx";
import PersonnelAppStatus from "./pages/personnel_management/personnel-app-status/PersonnelAppStatus.tsx";
import PDLVisitationStatus from "./pages/pdl_management/pdl-visitation-status/PDLVisitationStatus.tsx";
import PDLCategory from "./pages/pdl_management/pdl-category/PDLCategory.tsx";
import Geocodes from "./pages/oasis/maintenance/Geocodes.tsx";
import Alerts from "./pages/oasis/maintenance/Alerts.tsx";
import WatchlistType from "./pages/threat/WatchlistType.tsx";
import WatchlistRiskLevel from "./pages/threat/WatchlistRiskLevel.tsx";
import WatchlistThreatLevel from "./pages/threat/WatchlistThreatLevel.tsx";
import ServiceProvided from "./pages/service-provider/service-provided/ServiceProvided.tsx";
import VisitorRelPersonnel from "./pages/visitor_management/relationship/VisitorRelPersonnel.tsx";
import NonPDLReasonforVisit from "./pages/visitor_management/reason-for-visit/NonPDLReasonforVisit.tsx";
import ServiceProviderUpdate from "./pages/visitor_management/service-provider-data-entry/ServiceProviderUpdate.tsx";
import NPVisitorType from "./pages/Non-PDL/visitor-type/NPVisitorType.tsx";
import NonPdlVisitorUpdate from "./pages/visitor_management/non-pdl-visitor-data-entry/NonPDLVisitorUpdate.tsx";
import EncrytionParameters from "./pages/Settings/encryption-params/EncrytionParameters.tsx";


const Home = React.lazy(() => import("./pages/dashboard/Home.tsx"));
const RootLayout = React.lazy(() => import("./layout/RootLayout.tsx"));

function App() {
    const token = useTokenStore((state: { token: any; }) => state.token);
    const isAuthenticated = useAuthStore().isAuthenticated
    const { fetchSystemSettings } = useSystemSettingsStore();

    useEffect(() => {
        fetchSystemSettings(token)
    }, [fetchSystemSettings, token]);

    const router = createBrowserRouter([
        {
            path: "*",
            element: <GeneralErrorElement />
        },
        {
            path: "/login",
            element: <LoginOTP />,
        },
        {
            path: "/",
            element: <Landing />
        },
        {
            path: "map",
            element: <MapContent />
        },
        {
            path: "/jvms",
            element: isAuthenticated ? <RootLayout /> : <Navigate to="/login" />,
            errorElement: <Error />,
            children: [
                {/*
                    index: true,
                    element: <Home />,
                */},
                {
                    index: true,
                    element: <Dashboard />
                },
                {
                    path: "home",
                    element: <Home1 />
                },
                {
                    path: "home",
                    element: <Home2 />
                },
                {
                    path: "dashboard",
                    element: <Dashboard />
                },
                {
                    path: "dashboard2",
                    element: <Home />
                },
                {
                    path: "map",
                    element: <MapContent />
                },
                {
                    path: "alphalist",
                    element: <Alphalist />
                },
                {
                    path: "assets",
                    element: <Assets />
                },
                {
                    path: "assets/jail-facility",
                    element: <JailFacility />
                },
                {
                    path: "assets/level",
                    element: <Level />
                },
                {
                    path: "assets/annex",
                    element: <Annex />
                },
                {
                    path: "assets/dorms",
                    element: <Dorm />
                },
                {
                    path: "assets/areas",
                    element: <JailArea />
                },
                {
                    path: "assets/jail-type",
                    element: <JailType />
                },
                {
                    path: "assets/jail-categories",
                    element: <JailCategory />
                },
                {
                    path: "assets/jail-security",
                    element: <JailSecurityLevel />
                },
                {
                    path: "assets/devices",
                    element: <Device />
                },
                {
                    path: "assets/devices-type",
                    element: <DeviceType />
                },
                {
                    path: "assets/devices-usage",
                    element: <DeviceUsage />
                },
                {
                    path: "assets/device-setting",
                    element: <DeviceSetting />
                },
                {
                    path: "maintenance",
                    element: <Maintenance />
                },
                {
                    path: "maintenance/record-status",
                    element: <RecordStatus />
                },
                {
                    path: "maintenance/social-media-platforms",
                    element: <SocialMedia />
                },
                {
                    path: "maintenance/gender",
                    element: <Gender />
                },
                {
                    path: "maintenance/civil-status",
                    element: <CivilStatus />
                },
                {
                    path: "maintenance/id-types",
                    element: <ID_Types />
                },
                {
                    path: "maintenance/religion",
                    element: <Religion />
                },
                {
                    path: "maintenance/ethnicities",
                    element: <Ethnicity />
                },
                {
                    path: "maintenance/occupation",
                    element: <Occupation />
                },
                {
                    path: "maintenance/educational-attainments",
                    element: <EducationalAttainment />
                },
                {
                    path: "maintenance/prefixes",
                    element: <Prefixes />
                },
                {
                    path: "maintenance/suffixes",
                    element: <Suffixes />
                },
                {
                    path: "maintenance/contact-types",
                    element: <ContactType />
                },
                {
                    path: "maintenance/address-types",
                    element: <AddressType />
                },
                {
                    path: "maintenance/nationalities",
                    element: <Nationality />
                },
                {
                    path: "maintenance/multi-birth-classification",
                    element: <MultiBirth />
                },
                {
                    path: "maintenance/group-affiliation",
                    element: <GroupAffiliation />
                },
                {
                    path: "settings",
                    element: <Settings />
                },
                {
                    path: "settings/general-settings",
                    element: <GeneralSettings />
                },
                {
                    path: "settings/system-settings",
                    element: <SystemSettings />
                },
                {
                    path: "settings/encryption_parameters",
                    element: <EncrytionParameters />
                },
                {
                    path: "users",
                    element: <User />
                },
                {
                    path: "users/user",
                    element: <Users />
                },
                {
                    path: "users/roles",
                    element: <Roles />
                },
                {
                    path: "users/user-otp-account",
                    element: <OTP />
                },
                {
                    path: "tools",
                    element: <Tools />
                },
                {
                    path: "integrations",
                    element: <Integration />
                },
                {
                    path: "supports",
                    element: <Support />
                },
                {
                    path: "reports",
                    element: <MainReport />
                },
                {
                    path: "reports/dashboard-summary",
                    element: <DashboardSummary />
                },
                {
                    path: "reports/summary-count-of-PDL-visitors",
                    element: <SummaryCount />
                },
                {
                    path: "reports/summary-count-of-PDLs",
                    element: <SummaryCountofPDLs />
                },
                {
                    path: "reports/summary-count-of-personnel",
                    element: <SummaryCountofPersonnel />
                },
                {
                    path: "reports/list-of-pdl-visitor",
                    element: <ListPDLVisitors />
                },
                {
                    path: "reports/list-of-personnel",
                    element: <ListPersonnel />
                },
                {
                    path: "reports/list-of-pdls",
                    element: <ListPDLs />
                },
                {
                    path: "incidents",
                    element: <Incidents />
                },
                {
                    path: "incidents/incident-category",
                    element: <IncidentCategory />
                },
                {
                    path: "incidents/incident-type",
                    element: <IncidentType />
                },
                {
                    path: "incidents/incident-type",
                    element: <Incidents />
                },
                {
                    path: "incidents/incidents_list",
                    element: <IncidentTable />
                },
                {
                    path: "incidents/report",
                    element: <ReportAnIncident />
                },
                {
                    path: "threats",
                    element: <Threat />
                },
                {
                    path: "threats/watch-list",
                    element: <Watchlist />
                },
                {
                    path: "threats/watchlist_registration",
                    element: <AddWatchlist />
                },
                {
                    path: "threats/watchlist_types",
                    element: <WatchlistType />
                },
                {
                    path: "threats/watchlist_risk_level",
                    element: <WatchlistRiskLevel />
                },
                {
                    path: "threats/watchlist_threat_level",
                    element: <WatchlistThreatLevel />
                },
                {
                    path: "screening",
                    element: <Screening />
                },
                {
                    path: "screening/verify",
                    element: <Verify />
                },
                {
                    path: "pdls",
                    element: <PDL />
                },
                {
                    path: "pdls/pdl",
                    element: <PDLtable />
                },
                {
                    path: "pdls/pdl/update",
                    element: <UpdatePDL />
                },
                {
                    path: "pdls/skills",
                    element: <Skills />
                },
                {
                    path: "pdls/talents",
                    element: <Talents />
                },
                {
                    path: "pdls/court-branches",
                    element: <CourtBranch />
                },
                {
                    path: "pdls/gang-affiliation",
                    element: <GangAffiliation />
                },
                {
                    path: "pdls/police-precinct",
                    element: <Precinct />
                },
                {
                    path: "pdls/offenses",
                    element: <Offenses />
                },
                {
                    path: "pdls/law",
                    element: <Law />
                },
                {
                    path: "pdls/relationship",
                    element: <Relationship />
                },
                {
                    path: "pdls/crime-category",
                    element: <CrimeCategory />
                },
                {
                    path: "pdls/pdl-visitation-status",
                    element: <PDLVisitationStatus />
                },
                {
                    path: "pdls/pdl-category",
                    element: <PDLCategory />
                },
                {
                    path: "visitors",
                    element: <Visitors />
                },
                {
                    path: "visitors/visitor",
                    element: <Visitor />
                },
                {
                    path: "visitors/visitor/update-visitor",
                    element: <EditVisitor />
                },
                {
                    path: "visitors/visitor-type",
                    element: <VisitorType />
                },
                {
                    path: "visitors/visitor-req-docs",
                    element: <VisitorReqDocs />
                },
                {
                    path: "visitors/visitor-relationship-to-pdl",
                    element: <VisitorRelationship />
                },
                {
                    path: "visitors/visitor-registration",
                    element: <VisitorRegistration />
                },
                {
                    path: "visitors/visitor-identification",
                    element: <VisitorCodeIdentification />
                },
                {
                    path: "visitors/visitor-id",
                    element: <VisitorID />
                },
                {
                    path: "issues",
                    element: <Issues />
                },
                {
                    path: "issues/issue-type",
                    element: <IssueType />
                },
                {
                    path: "issues/issue-category",
                    element: <IssueCategory />
                },
                {
                    path: "issues/risk",
                    element: <Risk />
                },
                {
                    path: "issues/risk-level",
                    element: <RiskLevel />
                },
                {
                    path: "issues/impacts",
                    element: <Impact />
                },
                {
                    path: "issues/impact-level",
                    element: <ImpactLevel />
                },
                {
                    path: "issues/recommended-action",
                    element: <RecommendedAction />
                },
                {
                    path: "visitors/non-pdl-visitor",
                    element: <NonPdlVisitorRegistration />
                },
                {
                    path: "service-provider/service-provider-registration",
                    element: <ServiceProviderRegistration />
                },
                {
                    path: "service-provider/update",
                    element: <ServiceProviderUpdate />
                },
                {
                    path: "service-provider/service-provided",
                    element: <ServiceProvided />
                },
                {
                    path: "non-pdl-visitors/visitor-relationship-personnel",
                    element: <VisitorRelPersonnel />
                },
                {
                    path: "non-pdl-visitors/reason-for-visit",
                    element: <NonPDLReasonforVisit />
                },
                {
                    path: "personnels",
                    element: <Personnels />
                },
                {
                    path: "personnels/personnel",
                    element: <Personnel />
                },
                {
                    path: "personnels/personnel/update",
                    element: <PersonnelUpdate />
                },
                {
                    path: "personnels/ranks",
                    element: <Rank />
                },
                {
                    path: "personnels/positions",
                    element: <Position />
                },
                {
                    path: "personnels/employment-type",
                    element: <EmploymentType />
                },
                {
                    path: "personnels/personnel-designation",
                    element: <PersonnelDesignation />
                },
                {
                    path: "personnels/personnel-status",
                    element: <PersonnelStatus />
                },
                {
                    path: "personnels/personnel-type",
                    element: <PersonnelType />
                },
                {
                    path: "personnels/personnel-application-status",
                    element: <PersonnelAppStatus />
                },
                {
                    path: "maintenance/affiliation-type",
                    element: <AffiliationType />
                },
                {
                    path: "maintenance/gender",
                    element: <Gender />
                },
                {
                    path: "maintenance/civil-status",
                    element: <CivilStatus />
                },
                {
                    path: "maintenance/id-types",
                    element: <ID_Types />
                },
                {
                    path: "maintenance/record-status",
                    element: <RecordStatus />
                },
                {
                    path: "maintenance/social-media-platforms",
                    element: <SocialMedia />
                },
                {
                    path: "database",
                    element: <Database />
                },
                {
                    path: "registration",
                    element: <Registration />
                },
                {
                    path: "registration/bjmp-personnel",
                    element: <BJMPPersonnel />
                },
                {
                    path: "registration/pdl-registration",
                    element: <PdlRegistration />
                },
                {
                    path: "registration/personnel-registration",
                    element: <PersonnelRegistration />
                },
                {
                    path: "database/judicial-courts",
                    element: <Court />
                },
                {
                    path: "database/interest",
                    element: <Interest />
                },
                {
                    path: "database/looks",
                    element: <Looks />
                },
                {
                    path: "log-monitoring",
                    element: <LogMonitoring />
                },
                {
                    path: "log-monitoring/visit-logs",
                    element: <VisitLog />
                },
                {
                    path: "log-monitoring/pdl-visitors",
                    element: <PDLVisitors />
                },
                {
                    path: "log-monitoring/visitor_check-in-out_profiles",
                    element: <VisitorProfileSlider />
                },
                {
                    path: "non-pdl-visitors",
                    element: <NonPDL />
                },
                {
                    path: "non-pdl-visitors/non-pdl-visitor-type",
                    element: <NPVisitorType />
                },
                {
                    path: "non-pdl-visitors/update",
                    element: <NonPdlVisitorUpdate />
                },
                {
                    path: "service-provider",
                    element: <ServiceProvider />
                },
                {
                    path: "incidents/oasis/alerts",
                    element: <Alerts />
                },
                {
                    path: "incidents/oasis/alerts/add_alert",
                    element: <OasisAlertForm />
                },
                {
                    path: "incidents/oasis/status",
                    element: <Statuses />
                },
                {
                    path: "incidents/oasis/message_type",
                    element: <MessageTypes />
                },
                {
                    path: "incidents/oasis/scope",
                    element: <Scopes />
                },
                {
                    path: "incidents/oasis/restriction",
                    element: <Restrictions />
                },
                {
                    path: "incidents/oasis/code",
                    element: <Codes />
                },
                {
                    path: "incidents/oasis/note",
                    element: <Notes />
                },
                {
                    path: "incidents/oasis/language",
                    element: <Language />
                },
                {
                    path: "incidents/oasis/category",
                    element: <Categories />
                },
                {
                    path: "incidents/oasis/event",
                    element: <Events />
                },
                {
                    path: "incidents/oasis/response_type",
                    element: <ResponseTypes />
                },
                {
                    path: "incidents/oasis/urgency",
                    element: <Urgency />
                },
                {
                    path: "incidents/oasis/severity",
                    element: <Severity />
                },
                {
                    path: "incidents/oasis/certainty",
                    element: <Certainty />
                },
                {
                    path: "incidents/oasis/audience",
                    element: <Audience />
                },
                {
                    path: "incidents/oasis/event_code",
                    element: <EventCodes />
                },
                {
                    path: "incidents/oasis/instructions",
                    element: <Instructions />
                },
                {
                    path: "incidents/oasis/parameter",
                    element: <Parameter />
                },
                {
                    path: "incidents/oasis/geocode",
                    element: <Geocodes />
                },
                {
                    path: "person",
                    element: <Person />
                },
            ],
        },
    ],
        {
            future: {
                v7_startTransition: true
            },
        }
    );

    if (!isAuthenticated) {
        return <RouterProvider router={router} />;
    }

    return (

        <Suspense fallback={<Spinner />} >
            <RouterProvider router={router} />
        </Suspense>


        // <RouterProvider router={router} />

    );
}

export default App;
