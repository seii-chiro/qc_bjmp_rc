
export const sharedFields = {
    ID: false,
    shortName: false,
    name: true,
    age: true,
    gender: true,
    civilStatus: true,
    address: true,
    dateOfBirth: true,
    placeOfBirth: true,
    religion: true,
    type: false,
    firstName: false,
    middleName: false,
    lastName: false,
};

// All possible fields for visitor/personnel/pdl
const extraFields = {
    // Address
    // addressType: false,
    // barangay: false,
    // bldgSubdivision: false,
    // country: false,
    fullAddress: false,
    // isActive: false,
    // isCurrent: false,
    // municipality: false,
    // province: false,
    // street: false,
    // postalCode: false,
    // region: false,
    // streetNumber: false,
    // type: false,
    // Contact
    contactType: false,
    value: false,
    mobileImei: false,

    //Biometrics
    biometricStatus: false,
    // Talents & Interests
    talents: false,
    skills: false,
    interests: false,
    sports: false,
    musicalInstruments: false,
    // Identifiers
    identifierType: false,
    identifierIDNumber: false,
    identifierIssuedBy: false,
    identifierDateIssued: false,
    identifierExpiryDate: false,
    identifiersPlaceIssued: false,
    // Employment
    employmentName: false,
    jobTitle: false,
    employmentType: false,
    startDate: false,
    endDate: false,
    location: false,
    responsibilities: false,

    // Education
    educationalAttainment: false,
    institutionName: false,
    degree: false,
    fieldOfStudy: false,
    startYear: false,
    endYear: false,
    highestLevel: false,
    institutionAddress: false,
    honorsRecieved: false,

        // Social Media
    platform: false,
    handle: false,
    profileURL: false,
    isPrimaryAccount: false,

    // Affiliations
    organizationName: false,
    roleorPosition: false,
    affiliationStartDate: false,
    affiliationEndDate: false,
    affiliationType: false,
    description: false,

    // Diagnoses
    healthCondition: false,
    HealthConditionCategory: false,
    diagnosisDate: false,
    treatmentPlan: false,

    // Media Requirements
    requirementsName: false,
    requirementissuedBy: false,
    requirementdateIssued: false,
    requirementExpiryDate: false,
    requirementPlaceIssued: false,
    requirementStatus: false,

    // Media Identifier
    mediaIdentityIdNumber: false,
    mediaIdentityIssuedBy: false,
    mediaIdentityDateIssued: false,
    mediaIdentityExpiryDate: false,
    mediaIdentityPlaceIssued: false,
    mediaIdentityStatus: false,
    mediaIdentityIDType: false,

    // Multiple Birth Sibling
    personIDDisplay: false,
    siblingPerson: false,
    siblingPersonIDDisplay: false,
    multipleBirthClass: false,
    isIdentical: false,
    isVerified: false,

    // Family Record
    familyRecordRelationship: false,
    familyRecordFullName: false,
    familyRecordIsContactPerson: false,
    familyRecordContact: false,

    // Personnel/PDL specific
    status: false,
    
};

export const defaultVisitorFields = {
    ...sharedFields,
    ...extraFields,
    registrationNo: true,
};

export const defaultPersonnelFields = {
    ...sharedFields,
    ...extraFields,
    registrationNo: true,
    role: false,
    personnelType: false,
    position: false,
    rank: false,
    principle: false,
    ambition: false,
    designation: false,
    dateJoined: false,
    personnelAppStatus: false,
};

export const defaultPDLFields = {
    ...sharedFields,
    ...extraFields,
    status: false,
    visitationStatus: false,
    look: false,
    occupation: false,
    precinct: false,
    gangAffiliation: false,

    //Case
          //Offense
            offense:false,
            crimeCategory: false,
            law: false,
            crimeSeverity: false,
            punishment: false,

        //Court Branch
            courtProvince: false,
            courtRegion: false,
            court: false,
            branch: false,
            judge: false,

             //Other Case Details
                bailRecommended: false,
                fileNumber: false,
                caseNumber: false,
                dateCrimeCommitted: false,
                dateCommitted: false,
                caseName: false,
                sentenceLength: false,
                caseStatus: false,
                // voterStatus: false,
                // riskClassification: false,
                // noTimesArrested: false,
                // dateConvicted: false,
                // dateReleased: false,
                // dateHospitilized: false,
                // dateofAdmission: false,
                // expectedReleaseDate: false,
                // personnelAppStatus: false,
                //Jail
        jailName: false,
        jailType: false,
        jailCategory: false,
        emailAddress: false,
        contactNumber: false, 
        jailAddress: false,
        securityLevel: false,

        //Cell
        cellName: false,
        cellCapacity: false,
        cellStatus: false,
        floor: false,

        //Visitor
        registrationNo: false,
        visitor: false,
        visitorType: false,
        requirement: false,
        remarks: false,
};

// Affiliation fields
export const defaultAffiliationFields = {
    affiliationType: true,
    description: true,
};

//Device
export const defaultDeviceSettingFields = {
    device: true,
    key: true,
    value: true,
    description: true,
};