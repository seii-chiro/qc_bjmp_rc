import { calculateAge } from "@/functions/calculateAge";

    export const buildVisitorReport = (visitors: any[], fields: any, selectedGender: string | null) => {
      const headers: string[] = [];
      const body: any[][] = [];

      //Visitor Information Headers
      if (fields.registrationNo) headers.push('Registration No');
    //   if (fields.ID) headers.push('ID Number');
    //   if (fields.firstName) headers.push('First Name');
    //   if (fields.middleName) headers.push('Middle Name');
    //   if (fields.lastName) headers.push('Last Name');
      if (fields.name) headers.push('Name');
      if (fields.age) headers.push('Age');
      if (fields.gender) headers.push('Gender');
      if (fields.dateOfBirth) headers.push('Date of Birth');
      // if (fields.placeOfBirth) headers.push('Place of Birth');
      if (fields.civilStatus) headers.push('Civil Status');
      if (fields.religion) headers.push('Religion');

          //Address
    if (fields.fullAddress) headers.push('Full Address');
    if (fields.value) headers.push('Mobile Number');
    // if (fields.addressType) headers.push('Address Type');
    // if (fields.bldgSubdivision) headers.push('BLDG Subdivision');
    // if (fields.barangay) headers.push('Barangay');
    // if (fields.street) headers.push('Street');
    // if (fields.streetNumber) headers.push('Street Number');
    // if (fields.municipality) headers.push('Municipality');
    // if (fields.province) headers.push('Province');
    // if (fields.region) headers.push('Region');
    // if (fields.postalCode) headers.push('Postal Code');
    // if (fields.country) headers.push('Country');
    // if (fields.isActive) headers.push('Is Active');
    // if (fields.isCurrent) headers.push('Is Current');
    // if (fields.type) headers.push('Address Type');

    //Other Visitor Info
    if (fields.type) headers.push('Visitor Type');

      // Education Information
      if (fields.educationalAttainment) headers.push('Educational Attainment');
      if (fields.institutionName) headers.push('Institution Name');
      if (fields.degree) headers.push('Degree');
      if (fields.fieldOfStudy) headers.push('Field of Study');
      if (fields.startYear) headers.push('Start Year');
      if (fields.endYear) headers.push('End Year');
      if (fields.highestLevel) headers.push('Highest Level');
      if (fields.institutionAddress) headers.push('Institution Address');
      if (fields.honorsRecieved) headers.push('Honors Received');

      // Contact Information
      // if (fields.contactType) headers.push('Contact Type');
      
      // if (fields.mobileImei) headers.push('Mobile IMEI');

      //Biometrics
        if (fields.biometricStatus) headers.push('Biometric Status');

      //Talents & Interests
      if (fields.talents) headers.push('Talents');
      if (fields.skills) headers.push('Skills');
      if (fields.interests) headers.push('Interests');
      if (fields.sports) headers.push('Sports');
      if (fields.musicalInstruments) headers.push('Musical Instruments');

      //Identifiers
      if (fields.identifierType) headers.push('Identifier Type');
      if (fields.identifierIDNumber) headers.push('Identifier ID Number');
      if (fields.identifierIssuedBy) headers.push('Identifier Issued By');
      if (fields.identifierDateIssued) headers.push('Identifier Date Issued');
      if (fields.identifierExpiryDate) headers.push('Identifier Expiry Date');
      if (fields.identifiersPlaceIssued) headers.push('Identifiers Place Issued');

      // Employment Information
      if (fields.employmentName) headers.push('Employment Name');
      if (fields.jobTitle) headers.push('Job Title');
      if (fields.employmentType) headers.push('Employment Type');
      if (fields.startDate) headers.push('Start Date');
      if (fields.endDate) headers.push('End Date');
      if (fields.location) headers.push('Location');
      if (fields.responsibilities) headers.push('Responsibilities');



      // Social Media
      if (fields.platform) headers.push('Platform');
      if (fields.handle) headers.push('Handle');
      if (fields.profileURL) headers.push('Profile URL');
      if (fields.isPrimaryAccount) headers.push('Is Primary Account');

      // Affiliations
      if (fields.organizationName) headers.push('Organization Name');
      if (fields.roleorPosition) headers.push('Role/Position');
      if (fields.affiliationStartDate) headers.push('Affiliation Start Date');
      if (fields.affiliationEndDate) headers.push('Affiliation End Date');
      if (fields.affiliationType) headers.push('Affiliation Type');
      if (fields.description) headers.push('Description');
      // Diagnoses
      if (fields.healthCondition) headers.push('Health Condition');
      if (fields.healthConditionCategory) headers.push('Health Condition Category');
      if (fields.diagnosisDate) headers.push('Diagnosis Date');
      if (fields.treatmentPlan) headers.push('Treatment Plan');

      // Media Requirements
      if (fields.requirementsName) headers.push('Media Requirements');
      if (fields.requirementIssuedBy) headers.push('Requirement Issued By');
      if (fields.requirementDateIssued) headers.push('Requirement Date Issued');
      if (fields.requirementExpiryDate) headers.push('Requirement Expiry Date');
      if (fields.requiremtnPlaceIssued) headers.push('Requirement Place Issued');
      if (fields.requirementStatus) headers.push('Requirement Status');

      //Media Identifiers
      if (fields.mediaIdentityIdNumber) headers.push('Media Identifier ID');
      if (fields.mediaIdentityIssuedBy) headers.push('Media Identifier Issued By');
      if (fields.mediaIdentityDateIssued) headers.push('Media Identifier Date Issued');
      if (fields.mediaIdentityExpiryDate) headers.push('Media Identifier Expiry Date');
      if (fields.mediaIdentityPlaceIssued) headers.push('Media Identifier Place Issued');
      if (fields.mediaIdentityStatus) headers.push('Media Identifier Status');
      if (fields.mediaIdentityIDType) headers.push('Media Identifier ID Type');


      const filteredVisitors = selectedGender
              ? visitors.filter((item) => {
                  const genderOption = item?.person?.gender?.gender_option ?? "";
                  return genderOption.toLowerCase() === selectedGender.toLowerCase();
                })
              : visitors;
            
    filteredVisitors.forEach((v, i) => {
        const row = [i + 1];
        if (fields.registrationNo) row.push(v.visitor_reg_no ?? '');
        // if (fields.ID) row.push(v.id_number ?? '');
        // if (fields.firstName) row.push(v?.person?.first_name ?? '');
        // if (fields.middleName) row.push(v?.person?.middle_name ?? '');
        // if (fields.lastName) row.push(v?.person?.last_name ?? '');
        if (fields.name) row.push(`${v?.person?.first_name ?? ''} ${v?.person?.last_name ?? ''}`.trim());
        if (fields.age) {
            const age = v?.person?.date_of_birth ? String(calculateAge(v.person.date_of_birth)) : '';
            row.push(age || ''); // Ensure a value is present
        }
        if (fields.gender) row.push(v?.person?.gender?.gender_option ?? '');
        if (fields.dateOfBirth) row.push(v?.person?.date_of_birth ?? '');
        // if (fields.placeofBirth) row.push(v?.person?.place_of_birth ?? '');
        if (fields.civilStatus) row.push(v?.person?.civil_status ?? '');
        if (fields.religion) row.push(v?.person?.religion?.name ?? '');
        
        //Address
        if (fields.fullAddress) row.push(v?.person?.addresses?.[0]?.full_address ?? '');
        if (fields.value) row.push(Array.isArray(v?.person?.contacts) ? v.person.contacts.map(c => c.value).join(', ') : '');
        // if (fields.addressType) row.push(v?.person?.addresses?.[0]?.address_type ?? '');
        // if (fields.bldgSubdivision) row.push(v?.person?.addresses?.[0]?.bldg_subdivision ?? '');
        // if (fields.barangay) row.push(v?.person?.addresses?.[0]?.barangay ?? '');
        // if (fields.street) row.push(v?.person?.addresses?.[0]?.street ?? '');
        // if (fields.streetNumber) row.push(v?.person?.addresses?.[0]?.street_number ?? '');
        // if (fields.municipality) row.push(v?.person?.addresses?.[0]?.city_municipality ?? '');
        // if (fields.province) row.push(v?.person?.addresses?.[0]?.province ?? '');
        // if (fields.region) row.push(v?.person?.addresses?.[0]?.region ?? '');
        // if (fields.postalCode) row.push(v?.person?.addresses?.[0]?.postal_code ?? '');
        // if (fields.country) row.push(v?.person?.addresses?.[0]?.country ?? '');
        // if (fields.isActive) row.push(v?.person?.addresses?.[0]?.is_active ? 'Yes' : 'No');
        // if (fields.isCurrent) row.push(v?.person?.addresses?.[0]?.is_current ? 'Yes' : 'No');
        // if (fields.type) row.push(v?.person?.addresses?.[0]?.type ?? '');

        //Visitor other information
        if (fields.type) row.push(v?.visitor_type ?? '');

        // Education Information
        if (fields.educationalAttainment) row.push(v?.person?.education_backgrounds?.[0]?.educational_attainment ?? '');
        if (fields.institutionName) row.push(v?.person?.education_backgrounds?.[0]?.institution_name ?? '');
        if (fields.degree) row.push(v?.person?.education_backgrounds?.[0]?.degree ?? '');
        if (fields.fieldOfStudy) row.push(v?.person?.education_backgrounds?.[0]?.field_of_study ?? '');
        if (fields.startYear) row.push(v?.person?.education_backgrounds?.[0]?.start_year ?? '');
        if (fields.endYear) row.push(v?.person?.education_backgrounds?.[0]?.end_year ?? '');
        if (fields.highestLevel) row.push(v?.person?.education_backgrounds?.[0]?.highest_level ?? '');
        if (fields.institutionAddress) row.push(v?.person?.education_backgrounds?.[0]?.institution_address ?? '');
        if (fields.honorsRecieved) row.push(v?.person?.education_backgrounds?.[0]?.honors_received ?? '');

        //    Contact Information
        // if (fields.contactType) row.push(Array.isArray(v?.person?.contacts) ? v.person.contacts.map(c => c.contact_type).join(', ') : '');
        
        // if (fields.mobileImei) row.push(Array.isArray(v?.person?.contacts) ? v.person.contacts.map(c => c.mobile_imei).join(', ') : '');

        //Biometrics
        if (fields.biometricStatus) row.push(v?.person?.biometric_status?.status ?? '');

        //Talents & Interests
        if (fields.talents) row.push(v?.person?.talents[0]?.name?.join(', ') ?? '');
        if (fields.skills) row.push(v?.person?.skills?.name?.join(', ') ?? '');
        if (fields.interests) row.push(v?.person?.interests?.name?.join(', ') ?? '');
        if (fields.sports) row.push(v?.person?.sports?.name?.join(', ') ?? '');
        if (fields.musicalInstruments) row.push(v?.person?.musical_instruments?.name?.join(', ') ?? '');

        // Identifiers
        if (fields.identifierType) {
        row.push(
            Array.isArray(v?.person?.identifiers)
            ? v.person.identifiers.map((id: any) => id.id_type).filter(Boolean).join(', ')
            : v?.person?.identifiers?.id_type ?? ''
        );
        }
        if (fields.identifierIDNumber) {
        row.push(
            Array.isArray(v?.person?.identifiers)
            ? v.person.identifiers.map((id: any) => id.id_number).filter(Boolean).join(', ')
            : v?.person?.identifiers?.id_number ?? ''
        );
        }
        if (fields.identifierIssuedBy) {
        row.push(
            Array.isArray(v?.person?.identifiers)
            ? v.person.identifiers.map((id: any) => id.issued_by).filter(Boolean).join(', ')
            : v?.person?.identifiers?.issued_by ?? ''
        );
        }
        if (fields.identifierDateIssued) {
        row.push(
            Array.isArray(v?.person?.identifiers)
            ? v.person.identifiers.map((id: any) => id.date_issued).filter(Boolean).join(', ')
            : v?.person?.identifiers?.date_issued ?? ''
        );
        }
        if (fields.identifierExpiryDate) {
        row.push(
            Array.isArray(v?.person?.identifiers)
            ? v.person.identifiers.map((id: any) => id.expiry_date).filter(Boolean).join(', ')
            : v?.person?.identifiers?.expiry_date ?? ''
        );
        }
        if (fields.identifiersPlaceIssued) {
        row.push(
            Array.isArray(v?.person?.identifiers)
            ? v.person.identifiers.map((id: any) => id.place_issued).filter(Boolean).join(', ')
            : v?.person?.identifiers?.place_issued ?? ''
        );
        }

        // Employment Information
        if (fields.employmentName) row.push(v?.person?.employment_histories?.name ?? '');
        if (fields.jobTitle) row.push(v?.person?.employment_histories?.job_title ?? '');
        if (fields.employmentType) row.push(v?.person?.employment_histories?.employment_type ?? '');
        if (fields.startDate) row.push(v?.person?.employment_histories?.start_date ?? '');
        if (fields.endDate) row.push(v?.person?.employment_histories?.end_date ?? '');
        if (fields.location) row.push(v?.person?.employment_histories?.location ?? '');
        if (fields.responsibilities) row.push(v?.person?.employment_histories?.responsibilities ?? '');

        
        // Social Media
        if (fields.platform) row.push(Array.isArray(v?.person?.social_media_accounts) ? v.person.social_media_accounts.map(s => s.platform).join(', ') : '');
        if (fields.handle) row.push(v?.person?.social_media_accounts?.handle ?? '');
        if (fields.profileURL) row.push(v?.person?.social_media_accounts?.profile_url ?? '');
        if (fields.isPrimaryAccount) row.push(v?.person?.social_media_accounts?.is_primary_account ?? '');

        // Affiliations
        if (fields.organizationName) row.push(v?.person?.affiliations?.organization_name ?? '');
        if (fields.roleorPosition) row.push(v?.person?.affiliations?.role_or_position ?? '');
        if (fields.affiliationStartDate) row.push(v?.person?.affiliations?.affiliation_start_date ?? '');
        if (fields.affiliationEndDate) row.push(v?.person?.affiliations?.affiliation_end_date ?? '');
        if (fields.affiliationType) row.push(v?.person?.affiliations?.affiliation_type ?? '');
        if (fields.description) row.push(v?.person?.affiliations?.description ?? '');

        // Diagnoses
        if (fields.healthCondition) row.push(v?.person?.diagnoses?.health_condition ?? '');
        if (fields.healthConditionCategory) row.push(v?.person?.diagnoses?.health_condition_category ?? '');
        if (fields.diagnosisDate) row.push(v?.person?.diagnoses?.diagnosis_date ?? '');
        if (fields.treatmentPlan) row.push(v?.person?.diagnoses?.treatment_plan ?? '');

        // Media Requirements
        if (fields.requirementsName) row.push(v?.person?.media_requirements?.name ?? '');
        if (fields.requirementIssuedBy) row.push(v?.person?.media_requirements?.issued_by ?? '');
        if (fields.requirementDateIssued) row.push(v?.person?.media_requirements?.date_issued ?? '');
        if (fields.requirementExpiryDate) row.push(v?.person?.media_requirements?.expiry_date ?? '');
        if (fields.requirementPlaceIssued) row.push(v?.person?.media_requirements?.place_issued ?? '');
        if (fields.requirementStatus) row.push(v?.person?.media_requirements?.status ?? '');

        //Media Identifiers
        if (fields.mediaIdentityIdNumber) row.push(v?.person?.media_identifiers?.id_number ?? '');
        if (fields.mediaIdentityIssuedBy) row.push(v?.person?.media_identifiers?.issued_by ?? '');
        if (fields.mediaIdentityDateIssued) row.push(v?.person?.media_identifiers?.date_issued ?? '');
        if (fields.mediaIdentityExpiryDate) row.push(v?.person?.media_identifiers?.expiry_date ?? '');
        if (fields.mediaIdentityPlaceIssued) row.push(v?.person?.media_identifiers?.place_issued ?? '');
        if (fields.mediaIdentityStatus) row.push(v?.person?.media_identifiers?.status ?? '');
        if (fields.mediaIdentityIDType) row.push(v?.person?.media_identifiers?.id_type ?? '');
        body.push(row);
      });
      return { headers, body };
    };

    export const buildPersonnelReport = (personnel: any[], fields: any, selectedGender: string | null, selectedStatus: string | null) => {
      const headers: string[] = [];
      const body: any[][] = [];
      if (fields.registrationNo) headers.push('Registration No');
    //   if (fields.ID) headers.push('ID Number');
    //   if (fields.shortName) headers.push('Short Name');
    //   if (fields.firstName) headers.push('First Name');
    //   if (fields.middleName) headers.push('Middle Name');
    //   if (fields.lastName) headers.push('Last Name');
      if (fields.name) headers.push('Name');
      if (fields.age) headers.push('Age');
      if (fields.gender) headers.push('Gender');
      if (fields.dateOfBirth) headers.push('Date of Birth');
      if (fields.placeOfBirth) headers.push('Place of Birth');
      if (fields.civilStatus) headers.push('Civil Status');
      if (fields.religion) headers.push('Religion');
      
      //Personnel Information
    if (fields.role) headers.push('Role');
    if (fields.position) headers.push('Position');
    if (fields.rank) headers.push('Rank');
    if (fields.designation) headers.push('Designation');
    if (fields.personnelType) headers.push('Personnel Type');
    if (fields.status) headers.push('Status');
    if (fields.personnelAppStatus) headers.push('Personnel App Status');

    if (fields.ambition) headers.push('Ambition in Life');
    if (fields.principle) headers.push('Principle in Life');
    if (fields.dateJoined) headers.push('Date Joined');

    //Address
    if (fields.fullAddress) headers.push('Full Address');
    // if (fields.addressType) headers.push('Address Type');
    // if (fields.bldgSubdivision) headers.push('BLDG Subdivision');
    // if (fields.barangay) headers.push('Barangay');
    // if (fields.street) headers.push('Street');
    // if (fields.streetNumber) headers.push('Street Number');
    // if (fields.municipality) headers.push('Municipality');
    // if (fields.province) headers.push('Province');
    // if (fields.region) headers.push('Region');
    // if (fields.postalCode) headers.push('Postal Code');
    // if (fields.country) headers.push('Country');
    // if (fields.isActive) headers.push('Is Active');
    // if (fields.isCurrent) headers.push('Is Current');
    // if (fields.type) headers.push('Address Type');

    //    Contact Information
      // if (fields.contactType) headers.push('Contact Type');
      if (fields.value) headers.push('Mobile Number');
      // if (fields.mobileImei) headers.push('Mobile IMEI');

    

      // Education Information
      if (fields.educationalAttainment) headers.push('Educational Attainment');
      if (fields.institutionName) headers.push('Institution Name');
      if (fields.degree) headers.push('Degree');
      if (fields.fieldOfStudy) headers.push('Field of Study');
      if (fields.startYear) headers.push('Start Year');
      if (fields.endYear) headers.push('End Year');
      if (fields.highestLevel) headers.push('Highest Level');
      if (fields.institutionAddress) headers.push('Institution Address');
      if (fields.honorsRecieved) headers.push('Honors Received');

    //Biometrics
    if (fields.biometricStatus) headers.push('Biometric Status');

      //Talents & Interests
      if (fields.talents) headers.push('Talents');
      if (fields.skills) headers.push('Skills');
      if (fields.interests) headers.push('Interests');
      if (fields.sports) headers.push('Sports');
      if (fields.musicalInstruments) headers.push('Musical Instruments');

      //Identifiers
      if (fields.identifierType) headers.push('Identifier Type');
      if (fields.identifierIDNumber) headers.push('Identifier ID Number');
      if (fields.identifierIssuedBy) headers.push('Identifier Issued By');
      if (fields.identifierDateIssued) headers.push('Identifier Date Issued');
      if (fields.identifierExpiryDate) headers.push('Identifier Expiry Date');
      if (fields.identifiersPlaceIssued) headers.push('Identifiers Place Issued');

      // Employment Information
      if (fields.employmentName) headers.push('Employment Name');
      if (fields.jobTitle) headers.push('Job Title');
      if (fields.employmentType) headers.push('Employment Type');
      if (fields.startDate) headers.push('Start Date');
      if (fields.endDate) headers.push('End Date');
      if (fields.location) headers.push('Location');
      if (fields.responsibilities) headers.push('Responsibilities');

      // Social Media
      if (fields.platform) headers.push('Platform');
      if (fields.handle) headers.push('Handle');
      if (fields.profileURL) headers.push('Profile URL');
      if (fields.isPrimaryAccount) headers.push('Is Primary Account');

      // Affiliations
      if (fields.organizationName) headers.push('Organization Name');
      if (fields.roleorPosition) headers.push('Role/Position');
      if (fields.affiliationStartDate) headers.push('Affiliation Start Date');
      if (fields.affiliationEndDate) headers.push('Affiliation End Date');
      if (fields.affiliationType) headers.push('Affiliation Type');
      if (fields.description) headers.push('Description');
      // Diagnoses
      if (fields.healthCondition) headers.push('Health Condition');
      if (fields.healthConditionCategory) headers.push('Health Condition Category');
      if (fields.diagnosisDate) headers.push('Diagnosis Date');
      if (fields.treatmentPlan) headers.push('Treatment Plan');

      // Media Requirements
      if (fields.requirementsName) headers.push('Media Requirements');
      if (fields.requirementIssuedBy) headers.push('Requirement Issued By');
      if (fields.requirementDateIssued) headers.push('Requirement Date Issued');
      if (fields.requirementExpiryDate) headers.push('Requirement Expiry Date');
      if (fields.requiremtnPlaceIssued) headers.push('Requirement Place Issued');
      if (fields.requirementStatus) headers.push('Requirement Status');

      //Media Identifiers
      if (fields.mediaIdentityIdNumber) headers.push('Media Identifier ID');
      if (fields.mediaIdentityIssuedBy) headers.push('Media Identifier Issued By');
      if (fields.mediaIdentityDateIssued) headers.push('Media Identifier Date Issued');
      if (fields.mediaIdentityExpiryDate) headers.push('Media Identifier Expiry Date');
      if (fields.mediaIdentityPlaceIssued) headers.push('Media Identifier Place Issued');
      if (fields.mediaIdentityStatus) headers.push('Media Identifier Status');
      if (fields.mediaIdentityIDType) headers.push('Media Identifier ID Type');

      const filteredPersonnel = selectedGender || selectedStatus
              ? personnel.filter((item) => {
                  const genderOption = item?.person?.gender?.gender_option?.toLowerCase() || "";
                  const statusOption = item?.status?.toLowerCase() || "";

                  const genderMatches = !selectedGender || genderOption === selectedGender.toLowerCase();
                  const statusMatches = !selectedStatus || statusOption === selectedStatus.toLowerCase();

                  return genderMatches && statusMatches;
              })
              : personnel;

      filteredPersonnel.forEach((p, i) => {
        const row = [i + 1];
        if (fields.registrationNo) row.push(p?.personnel_reg_no ?? '');
        // if (fields.ID) row.push(p?.id_number ?? '');
        // if (fields.shortName) row.push(p?.shortname ?? '');
        // if (fields.firstName) row.push(p?.person?.first_name ?? '');
        // if (fields.middleName) row.push(p?.person?.middle_name ?? '');
        // if (fields.lastName) row.push(p?.person?.last_name ?? '');
        if (fields.name) row.push(`${p?.person?.first_name ?? ''} ${p?.person?.last_name ?? ''}`.trim());
        if (fields.age) {
            const age = p?.person?.date_of_birth ? String(calculateAge(p.person.date_of_birth)) : '';
            if (age) row.push(age);
        }
        if (fields.gender) row.push(p?.person?.gender?.gender_option ?? '');
        
        if (fields.dateOfBirth) row.push(p?.person?.date_of_birth ?? '');
        if (fields.placeOfBirth) row.push(p?.person?.place_of_birth ?? '');
        if (fields.civilStatus) row.push(p?.person?.civil_status ?? '');
        if (fields.religion) row.push(p?.person?.religion?.name ?? '');

        //Personnel Information
        if (fields.role) row.push(p?.role ?? '');
        if (fields.position) row.push(p?.position ?? '');
        if (fields.rank) row.push(p?.rank ?? '');
        if (fields.designation) row.push(Array.isArray(p?.designations) ? p.designations.map(d => d.name).join(', ') : '');
        if (fields.personnelType) row.push(p?.personnel_type ?? '');
        if (fields.status) row.push(p?.status ?? '');
        if (fields.personnelAppStatus) row.push(p?.personnel_app_status ?? '');

        if (fields.ambition) row.push(p?.ambition_in_life ?? '');
        if (fields.principle) row.push(p?.principle_in_life ?? '');
        if (fields.dateJoined) row.push(p?.date_joined ?? '');

        //Address
        if (fields.fullAddress) row.push(p?.person?.addresses?.[0]?.full_address ?? '');
        // if (fields.addressType) row.push(p?.person?.addresses?.[0]?.address_type ?? '');
        // if (fields.bldgSubdivision) row.push(p?.person?.addresses?.[0]?.bldg_subdivision ?? '');
        // if (fields.barangay) row.push(p?.person?.addresses?.[0]?.barangay ?? '');
        // if (fields.street) row.push(p?.person?.addresses?.[0]?.street ?? '');
        // if (fields.streetNumber) row.push(p?.person?.addresses?.[0]?.street_number ?? '');
        // if (fields.municipality) row.push(p?.person?.addresses?.[0]?.city_municipality ?? '');
        // if (fields.province) row.push(p?.person?.addresses?.[0]?.province ?? '');
        // if (fields.region) row.push(p?.person?.addresses?.[0]?.region ?? '');
        // if (fields.postalCode) row.push(p?.person?.addresses?.[0]?.postal_code ?? '');
        // if (fields.country) row.push(p?.person?.addresses?.[0]?.country ?? '');
        // if (fields.isActive) row.push(p?.person?.addresses?.[0]?.is_active ? 'Yes' : 'No');
        // if (fields.isCurrent) row.push(p?.person?.addresses?.[0]?.is_current ? 'Yes' : 'No');
        // if (fields.type) row.push(p?.person?.addresses?.[0]?.type ?? '');

        //    Contact Information
        // if (fields.contactType) row.push(Array.isArray(p?.person?.contacts) ? p.person.contacts.map(c => c.contact_type).join(', ') : '');
        if (fields.value) row.push(Array.isArray(p?.person?.contacts) ? p.person.contacts.map(c => c.value).join(', ') : '');
        // if (fields.mobileImei) row.push(Array.isArray(p?.person?.contacts) ? p.person.contacts.map(c => c.mobile_imei).join(', ') : '');

        // Education Information
        if (fields.educationalAttainment) row.push(p?.person?.education_backgrounds?.[0]?.educational_attainment ?? '');
        if (fields.institutionName) row.push(p?.person?.education_backgrounds?.[0]?.institution_name ?? '');
        if (fields.degree) row.push(p?.person?.education_backgrounds?.[0]?.degree ?? '');
        if (fields.fieldOfStudy) row.push(p?.person?.education_backgrounds?.[0]?.field_of_study ?? '');
        if (fields.startYear) row.push(p?.person?.education_backgrounds?.[0]?.start_year ?? '');
        if (fields.endYear) row.push(p?.person?.education_backgrounds?.[0]?.end_year ?? '');
        if (fields.highestLepel) row.push(p?.person?.education_backgrounds?.[0]?.highest_lepel ?? '');
        if (fields.institutionAddress) row.push(p?.person?.education_backgrounds?.[0]?.institution_address ?? '');
        if (fields.honorsRecieped) row.push(p?.person?.education_backgrounds?.[0]?.honors_receiped ?? '');

        //Biometrics
        if (fields.biometricStatus) row.push(p?.person?.biometric_status?.status ?? '');

        //Talents & Interests
          if (fields.talents) row.push(Array.isArray(p?.person?.talents) ? p.person.talents.map(t => t.name).join(', ') : '');
          if (fields.skills) row.push(Array.isArray(p?.person?.skills) ? p.person.skills.map(s => s.name).join(', ') : '');
          if (fields.interests) row.push(Array.isArray(p?.person?.interests) ? p.person.interests.map(i => i.name).join(', ') : '');
          if (fields.sports) row.push(Array.isArray(p?.person?.sports) ? p.person.sports.map(s => s.name).join(', ') : '');
          if (fields.musicalInstruments) row.push(Array.isArray(p?.person?.musical_instruments) ? p.person.musical_instruments.map(m => m.name).join(', ') : '');

        //Identifiers
        if (fields.identifierType) row.push(p?.person?.identifiers?.id_type ?? '');
        if (fields.identifierIDNumber) row.push(p?.person?.identifiers?.id_number ?? '');
        if (fields.identifierIssuedBy) row.push(p?.person?.identifiers?.issued_by ?? '');
        if (fields.identifierDateIssued) row.push(p?.person?.identifiers?.date_issued ?? '');
        if (fields.identifierExpiryDate) row.push(p?.person?.identifiers?.expiry_date ?? '');
        if (fields.identifiersPlaceIssued) row.push(p?.person?.identifiers?.place_issued ?? '');

        // Employment Information
        if (fields.employmentName) row.push(p?.person?.employment_histories?.name ?? '');
        if (fields.jobTitle) row.push(p?.person?.employment_histories?.job_title ?? '');
        if (fields.employmentType) row.push(p?.person?.employment_histories?.employment_type ?? '');
        if (fields.startDate) row.push(p?.person?.employment_histories?.start_date ?? '');
        if (fields.endDate) row.push(p?.person?.employment_histories?.end_date ?? '');
        if (fields.location) row.push(p?.person?.employment_histories?.location ?? '');
        if (fields.responsibilities) row.push(p?.person?.employment_histories?.responsibilities ?? '');

        // Social Media
        if (fields.platform) row.push(Array.isArray(p?.person?.social_media_accounts) ? p.person.social_media_accounts.map(s => s.platform).join(', ') : '');
        if (fields.handle) row.push(p?.person?.social_media_accounts?.handle ?? '');
        if (fields.profileURL) row.push(p?.person?.social_media_accounts?.profile_url ?? '');
        if (fields.isPrimaryAccount) row.push(p?.person?.social_media_accounts?.is_primary_account ?? '');

        // Affiliations
        if (fields.organizationName) row.push(p?.person?.affiliations?.organization_name ?? '');
        if (fields.roleorPosition) row.push(p?.person?.affiliations?.role_or_position ?? '');
        if (fields.affiliationStartDate) row.push(p?.person?.affiliations?.affiliation_start_date ?? '');
        if (fields.affiliationEndDate) row.push(p?.person?.affiliations?.affiliation_end_date ?? '');
        if (fields.affiliationType) row.push(p?.person?.affiliations?.affiliation_type ?? '');
        if (fields.description) row.push(p?.person?.affiliations?.description ?? '');

        // Diagnoses
        if (fields.healthCondition) row.push(p?.person?.diagnoses?.health_condition ?? '');
        if (fields.healthConditionCategory) row.push(p?.person?.diagnoses?.health_condition_category ?? '');
        if (fields.diagnosisDate) row.push(p?.person?.diagnoses?.diagnosis_date ?? '');
        if (fields.treatmentPlan) row.push(p?.person?.diagnoses?.treatment_plan ?? '');

        // Media Requirements
        if (fields.requirementsName) row.push(p?.person?.media_requirements?.name ?? '');
        if (fields.requirementIssuedBy) row.push(p?.person?.media_requirements?.issued_by ?? '');
        if (fields.requirementDateIssued) row.push(p?.person?.media_requirements?.date_issued ?? '');
        if (fields.requirementExpiryDate) row.push(p?.person?.media_requirements?.expiry_date ?? '');
        if (fields.requirementPlaceIssued) row.push(p?.person?.media_requirements?.place_issued ?? '');
        if (fields.requirementStatus) row.push(p?.person?.media_requirements?.status ?? '');

        //Media Identifiers
        if (fields.mediaIdentityIdNumber) row.push(p?.person?.media_identifiers?.id_number ?? '');
        if (fields.mediaIdentityIssuedBy) row.push(p?.person?.media_identifiers?.issued_by ?? '');
        if (fields.mediaIdentityDateIssued) row.push(p?.person?.media_identifiers?.date_issued ?? '');
        if (fields.mediaIdentityExpiryDate) row.push(p?.person?.media_identifiers?.expiry_date ?? '');
        if (fields.mediaIdentityPlaceIssued) row.push(p?.person?.media_identifiers?.place_issued ?? '');
        if (fields.mediaIdentityStatus) row.push(p?.person?.media_identifiers?.status ?? '');
        if (fields.mediaIdentityIDType) row.push(p?.person?.media_identifiers?.id_type ?? '');
        body.push(row);

        //Multiple Birth Siblings

    });

    return { headers, body };
    };

    export const buildPDLReport = (pdl: any[], fields: any, selectedGender: string | null, selectedStatus: string | null) => {
        const headers: string[] = [];
        const body: any[][] = [];

        // if (fields.registrationNo) headers.push('Registration No');
        // if (fields.firstName) headers.push('First Name');
        // if (fields.middleName) headers.push('Middle Name');
        // if (fields.lastName) headers.push('Last Name');
        if (fields.name) headers.push('Name');
        if (fields.age) headers.push('Age');
        if (fields.gender) headers.push('Gender');
        if (fields.status) headers.push('Status');
        if (fields.dateOfBirth) headers.push('Date of Birth');
        if (fields.placeOfBirth) headers.push('Place of Birth');
        if (fields.civilStatus) headers.push('Civil Status');
        if (fields.religion) headers.push('Religion');
        if (fields.fullAddress) headers.push('Full Address');

        //PDL Information
        if (fields.visitationStatus) headers.push('Visitation Status');
        if (fields.gangAffiliation) headers.push('Gang Affiliation');
        if (fields.look) headers.push('Look');
        if (fields.occupation) headers.push('Occupation');
        if (fields.precinct) headers.push('Precinct');

        //Address
    
    // if (fields.addressType) headers.push('Address Type');
    // if (fields.bldgSubdivision) headers.push('BLDG Subdivision');
    // if (fields.barangay) headers.push('Barangay');
    // if (fields.street) headers.push('Street');
    // if (fields.streetNumber) headers.push('Street Number');
    // if (fields.municipality) headers.push('Municipality');
    // if (fields.province) headers.push('Province');
    // if (fields.region) headers.push('Region');
    // if (fields.postalCode) headers.push('Postal Code');
    // if (fields.country) headers.push('Country');
    // if (fields.isActive) headers.push('Is Active');
    // if (fields.isCurrent) headers.push('Is Current');
    // if (fields.type) headers.push('Address Type');

      // Education Information
      if (fields.educationalAttainment) headers.push('Educational Attainment');
      if (fields.institutionName) headers.push('Institution Name');
      if (fields.degree) headers.push('Degree');
      if (fields.fieldOfStudy) headers.push('Field of Study');
      if (fields.startYear) headers.push('Start Year');
      if (fields.endYear) headers.push('End Year');
      if (fields.highestLevel) headers.push('Highest Level');
      if (fields.institutionAddress) headers.push('Institution Address');
      if (fields.honorsRecieved) headers.push('Honors Received');
    //    Contact Information
      // if (fields.contactType) headers.push('Contact Type');
      if (fields.value) headers.push('Mobile Number');
      // if (fields.mobileImei) headers.push('Mobile IMEI');

    //Visitor
    if (fields.registrationNo) headers.push('Registration No.');
    if (fields.visitor) headers.push('Visitor');
    if (fields.visitorType) headers.push('Visitor Type');
    if (fields.requirement) headers.push('Visitor Requirements');
    if (fields.remarks) headers.push('Remarks');

    //Biometrics
    if (fields.biometricStatus) headers.push('Biometric Status');

    //Case
        //Offense
        if (fields.offense) headers.push('Offense');
        if (fields.crimeCategory) headers.push('Crime Category');
        if (fields.law) headers.push('Law');
        if (fields.crimeSeverity) headers.push('Crime Severity');
        if (fields.punishment) headers.push('Punishment');

        //court branch
        if (fields.court) headers.push('Court');
        if (fields.branch) headers.push('Branch');
        if (fields.judge) headers.push('Judge');
        if (fields.courtProvince) headers.push('Court Province');
        if (fields.courtRegion) headers.push('Court Region');

        //Case Information
        if (fields.bailRecommended) headers.push('Bail Recommended');
        if (fields.fileNumber) headers.push('File Number');
        if (fields.caseNumber) headers.push('Case Number');
        if (fields.dateCrimeCommitted) headers.push('Date Crime Committed');
        if (fields.dateCommitted) headers.push('Date Committed');
        if (fields.caseName) headers.push('Case Name');
        if (fields.caseStatus) headers.push('Case Status');
        if (fields.sentenceLength) headers.push('Sentence Length');

        //Jail 
        if (fields.jailName) headers.push('Jail Name');
        if (fields.jailType) headers.push('Jail Type');
        if (fields.jailCategory) headers.push('Jail Category');
        if (fields.emailAddress) headers.push('Email Address');
        if (fields.contactNumber) headers.push('Contact Number');
        if (fields.jailAddress) headers.push('Jail Address');
        if (fields.securityLevel) headers.push('Security Level');

        //Cell
        if (fields.cellName) headers.push('Dorm Name');
        if (fields.cellStatus) headers.push('Dorm Status');
        if (fields.floor) headers.push('Annex');
        
      //Talents & Interests
      if (fields.talents) headers.push('Talents');
      if (fields.skills) headers.push('Skills');
      if (fields.interests) headers.push('Interests');
      if (fields.sports) headers.push('Sports');
      if (fields.musicalInstruments) headers.push('Musical Instruments');

      //Identifiers
      if (fields.identifierType) headers.push('Identifier Type');
      if (fields.identifierIDNumber) headers.push('Identifier ID Number');
      if (fields.identifierIssuedBy) headers.push('Identifier Issued By');
      if (fields.identifierDateIssued) headers.push('Identifier Date Issued');
      if (fields.identifierExpiryDate) headers.push('Identifier Expiry Date');
      if (fields.identifiersPlaceIssued) headers.push('Identifiers Place Issued');

      // Employment Information
      if (fields.employmentName) headers.push('Employment Name');
      if (fields.jobTitle) headers.push('Job Title');
      if (fields.employmentType) headers.push('Employment Type');
      if (fields.startDate) headers.push('Start Date');
      if (fields.endDate) headers.push('End Date');
      if (fields.location) headers.push('Location');
      if (fields.responsibilities) headers.push('Responsibilities');



      // Social Media
      if (fields.platform) headers.push('Platform');
      if (fields.handle) headers.push('Handle');
      if (fields.profileURL) headers.push('Profile URL');
      if (fields.isPrimaryAccount) headers.push('Is Primary Account');

      // Affiliations
      if (fields.organizationName) headers.push('Organization Name');
      if (fields.roleorPosition) headers.push('Role/Position');
      if (fields.affiliationStartDate) headers.push('Affiliation Start Date');
      if (fields.affiliationEndDate) headers.push('Affiliation End Date');
      if (fields.affiliationType) headers.push('Affiliation Type');
      if (fields.description) headers.push('Description');
      // Diagnoses
      if (fields.healthCondition) headers.push('Health Condition');
      if (fields.healthConditionCategory) headers.push('Health Condition Category');
      if (fields.diagnosisDate) headers.push('Diagnosis Date');
      if (fields.treatmentPlan) headers.push('Treatment Plan');

      // Media Requirements
      if (fields.requirementsName) headers.push('Media Requirements');
      if (fields.requirementIssuedBy) headers.push('Requirement Issued By');
      if (fields.requirementDateIssued) headers.push('Requirement Date Issued');
      if (fields.requirementExpiryDate) headers.push('Requirement Expiry Date');
      if (fields.requiremtnPlaceIssued) headers.push('Requirement Place Issued');
      if (fields.requirementStatus) headers.push('Requirement Status');

      //Media Identifiers
      if (fields.mediaIdentityIdNumber) headers.push('Media Identifier ID');
      if (fields.mediaIdentityIssuedBy) headers.push('Media Identifier Issued By');
      if (fields.mediaIdentityDateIssued) headers.push('Media Identifier Date Issued');
      if (fields.mediaIdentityExpiryDate) headers.push('Media Identifier Expiry Date');
      if (fields.mediaIdentityPlaceIssued) headers.push('Media Identifier Place Issued');
      if (fields.mediaIdentityStatus) headers.push('Media Identifier Status');
      if (fields.mediaIdentityIDType) headers.push('Media Identifier ID Type');


        const filteredPDL = selectedGender || selectedStatus
                ? pdl.filter((item) => {
                    const genderOption = item?.person?.gender?.gender_option?.toLowerCase() || "";
                    const statusOption = item?.status?.toLowerCase() || "";

                    const genderMatches = !selectedGender || genderOption === selectedGender.toLowerCase();
                    const statusMatches = !selectedStatus || statusOption === selectedStatus.toLowerCase();

                    return genderMatches && statusMatches;
                    })
                : pdl;

        filteredPDL.forEach((p, i) => {
            const row = [i + 1];
            // if (fields.firstName) row.push(p?.person?.first_name ?? '');
            // if (fields.middleName) row.push(p?.person?.middle_name ?? '');
            // if (fields.lastName) row.push(p?.person?.last_name ?? '');
            if (fields.name) row.push(`${p?.person?.first_name ?? ''} ${p?.person?.last_name ?? ''}`.trim());
            if (fields.age) {
                const age = p?.person?.date_of_birth ? String(calculateAge(p.person.date_of_birth)) : '';
                if (age) row.push(age);
            }
            if (fields.gender) row.push(p?.person?.gender?.gender_option ?? '');
            
            if (fields.status) row.push(p?.status ?? '');
            if (fields.dateOfBirth) row.push(p?.person?.date_of_birth ?? '');
            if (fields.placeOfBirth) row.push(p?.person?.place_of_birth ?? '');
            if (fields.civilStatus) row.push(p?.person?.civil_status ?? '');
            if (fields.religion) row.push(p?.person?.religion?.name ?? '');
            if (fields.fullAddress) row.push(p?.person?.addresses?.[0]?.full_address ?? '');

            //PDL other Information
            if (fields.visitationStatus) row.push(p?.visitation_status ?? '');
            if (fields.gangAffiliation) row.push(p?.gang_affiliation ?? '');
            if (fields.look) row.push(p?.look ?? '');
            if (fields.occupation) row.push(p?.occupation ?? '');
            if (fields.precinct) row.push(p?.precinct ?? '');

            //Address
        
        // if (fields.addressType) row.push(p?.person?.addresses?.[0]?.address_type ?? '');
        // if (fields.bldgSubdivision) row.push(p?.person?.addresses?.[0]?.bldg_subdivision ?? '');
        // if (fields.barangay) row.push(p?.person?.addresses?.[0]?.barangay ?? '');
        // if (fields.street) row.push(p?.person?.addresses?.[0]?.street ?? '');
        // if (fields.streetNumber) row.push(p?.person?.addresses?.[0]?.street_number ?? '');
        // if (fields.municipality) row.push(p?.person?.addresses?.[0]?.city_municipality ?? '');
        // if (fields.province) row.push(p?.person?.addresses?.[0]?.province ?? '');
        // if (fields.region) row.push(p?.person?.addresses?.[0]?.region ?? '');
        // if (fields.postalCode) row.push(p?.person?.addresses?.[0]?.postal_code ?? '');
        // if (fields.country) row.push(p?.person?.addresses?.[0]?.country ?? '');
        // if (fields.isActive) row.push(p?.person?.addresses?.[0]?.is_active ? 'Yes' : 'No');
        // if (fields.isCurrent) row.push(p?.person?.addresses?.[0]?.is_current ? 'Yes' : 'No');
        // if (fields.type) row.push(p?.person?.addresses?.[0]?.type ?? '');

        //    Contact Information
        // if (fields.contactType) row.push(Array.isArray(p?.person?.contacts) ? p.person.contacts.map(c => c.contact_type).join(', ') : '');
        if (fields.value) row.push(Array.isArray(p?.person?.contacts) ? p.person.contacts.map(c => c.value).join(', ') : '');
        // if (fields.mobileImei) row.push(Array.isArray(p?.person?.contacts) ? p.person.contacts.map(c => c.mobile_imei).join(', ') : '');

        //Visitor
        if (fields.registrationNo) row.push(Array.isArray(p?.visitor) ? p.visitor.map(v => v.visitor_reg_no).join(', ') : '');
        if (fields.visitor) row.push(Array.isArray(p?.visitor) ? p.visitor.map(v => v.person).join(', ') : '');
        if (fields.visitorType) row.push(Array.isArray(p?.visitor) ? p.visitor.map(v => v.visitor_type).join(', ') : '');
        if (fields.requirement) row.push(Array.isArray(p?.visitor) ? p.visitor.map(v => v.requirement).join(', ') : '');
        if (fields.remarks) row.push(Array.isArray(p?.visitor) ? p.visitor.map(v => v.remarks).join(', ') : '');

        //Biometrics
        if (fields.biometricStatus) row.push(p?.person?.biometric_status?.status ?? '');

        //Case
        //Offense
        if (fields.offense) row.push(Array.isArray(p?.person?.cases) ? p.person.cases.map(c => c.offense).join(', ') : '');
        if (fields.crimeCategory) row.push(Array.isArray(p?.person?.cases) ? p.person.cases.map(c => c.crime_category).join(', ') : '')
        if (fields.law) row.push(Array.isArray(p?.person?.cases) ? p.person.cases.map(c => c.law).join(', ') : '');
        if (fields.crimeSeverity) row.push(Array.isArray(p?.person?.cases) ? p.person.cases.map(c => c.crime_severity).join(', ') : '');
        if (fields.punishment) row.push(Array.isArray(p?.person?.cases) ? p.person.cases.map(c => c.punishment).join(', ') : '');

        //Court Branch
        if (fields.court) row.push(p?.person?.cases?.[0]?.court_branch?.court ?? '');
        if (fields.branch) row.push(p?.person?.cases?.[0]?.court_branch?.branch ?? '');
        if (fields.judge) row.push(p?.person?.cases?.[0]?.court_branch?.judge ?? '');
        if (fields.courtProvince) row.push(p?.person?.cases?.[0]?.court_branch?.province ?? '');
        if (fields.courtRegion) row.push(p?.person?.cases?.[0]?.court_branch?.region ?? '');

        //Case Information
        if (fields.bailRecommended) row.push(p?.person?.cases?.[0]?.bail_recommended);
        if (fields.fileNumber) row.push(p?.person?.cases?.[0]?.file_number ?? '');
        if (fields.caseNumber) row.push(p?.person?.cases?.[0]?.case_number ?? '');
        if (fields.dateCrimeCommitted) row.push(p?.person?.cases?.[0]?.date_crime_committed ?? '');
        if (fields.dateCommitted) row.push(p?.person?.cases?.[0]?.date_committed ?? '');
        if (fields.caseName) row.push(p?.person?.cases?.[0]?.name ?? '');
        if (fields.caseStatus) row.push(p?.person?.cases?.[0]?.status ?? '');
        if (fields.sentenceLength) row.push(p?.person?.cases?.[0]?.sentence_length ?? '');

        //Jail
        if (fields.jailName) row.push(p?.jail?.jail_name ?? '');
        if (fields.jailType) row.push(p?.jail?.jail_type ?? '');
        if (fields.jailCategory) row.push(p?.jail?.jail_category ?? '');
        if (fields.emailAddress) row.push(p?.jail?.email_address ?? '');
        if (fields.contactNumber) row.push(p?.jail?.contact_number ?? '');
        if (fields.jailAddress) {
            const postalCode = p?.jail?.jail_postal_code ?? '';
            const province = p?.jail?.jail_province ?? '';
            const municipality = p?.jail?.jail_city_municipality ?? '';
            const region = p?.jail?.jail_region ?? '';
            const barangay = p?.jail?.jail_barangay ?? '';
            const street = p?.jail?.jail_street ?? '';

            const fullAddress = [street, barangay, municipality, province, region, postalCode]
                .filter(part => part) // Remove any empty parts
                .join(', '); // Join with a comma and space

            row.push(fullAddress);
        }
        if (fields.securityLevel) row.push(p?.jail?.security_level ?? '');

        //Cell
        if (fields.cellName) row.push(p?.cell?.cell_name ?? '');
        if (fields.cellStatus) row.push(p?.cell?.cell_status ?? '');
        if (fields.floor) row.push(p?.cell?.floor ?? '');


        // Education Information
        if (fields.educationalAttainment) row.push(p?.person?.education_backgrounds?.[0]?.educational_attainment ?? '');
        if (fields.institutionName) row.push(p?.person?.education_backgrounds?.[0]?.institution_name ?? '');
        if (fields.degree) row.push(p?.person?.education_backgrounds?.[0]?.degree ?? '');
        if (fields.fieldOfStudy) row.push(p?.person?.education_backgrounds?.[0]?.field_of_study ?? '');
        if (fields.startYear) row.push(p?.person?.education_backgrounds?.[0]?.start_year ?? '');
        if (fields.endYear) row.push(p?.person?.education_backgrounds?.[0]?.end_year ?? '');
        if (fields.highestLepel) row.push(p?.person?.education_backgrounds?.[0]?.highest_lepel ?? '');
        if (fields.institutionAddress) row.push(p?.person?.education_backgrounds?.[0]?.institution_address ?? '');
        if (fields.honorsRecieped) row.push(p?.person?.education_backgrounds?.[0]?.honors_receiped ?? '');

        //Talents & Interests
          if (fields.talents) row.push(Array.isArray(p?.person?.talents) ? p.person.talents.map(t => t.name).join(', ') : '');
          if (fields.skills) row.push(Array.isArray(p?.person?.skills) ? p.person.skills.map(s => s.name).join(', ') : '');
          if (fields.interests) row.push(Array.isArray(p?.person?.interests) ? p.person.interests.map(i => i.name).join(', ') : '');
          if (fields.sports) row.push(Array.isArray(p?.person?.sports) ? p.person.sports.map(s => s.name).join(', ') : '');
          if (fields.musicalInstruments) row.push(Array.isArray(p?.person?.musical_instruments) ? p.person.musical_instruments.map(m => m.name).join(', ') : '');

        //Identifiers
        if (fields.identifierType) row.push(p?.person?.identifiers?.id_type ?? '');
        if (fields.identifierIDNumber) row.push(p?.person?.identifiers?.id_number ?? '');
        if (fields.identifierIssuedBy) row.push(p?.person?.identifiers?.issued_by ?? '');
        if (fields.identifierDateIssued) row.push(p?.person?.identifiers?.date_issued ?? '');
        if (fields.identifierExpiryDate) row.push(p?.person?.identifiers?.expiry_date ?? '');
        if (fields.identifiersPlaceIssued) row.push(p?.person?.identifiers?.place_issued ?? '');

        // Employment Information
        if (fields.employmentName) row.push(p?.person?.employment_histories?.name ?? '');
        if (fields.jobTitle) row.push(p?.person?.employment_histories?.job_title ?? '');
        if (fields.employmentType) row.push(p?.person?.employment_histories?.employment_type ?? '');
        if (fields.startDate) row.push(p?.person?.employment_histories?.start_date ?? '');
        if (fields.endDate) row.push(p?.person?.employment_histories?.end_date ?? '');
        if (fields.location) row.push(p?.person?.employment_histories?.location ?? '');
        if (fields.responsibilities) row.push(p?.person?.employment_histories?.responsibilities ?? '');
        
        // Social Media
        if (fields.platform) row.push(Array.isArray(p?.person?.social_media_accounts) ? p.person.social_media_accounts.map(s => s.platform).join(', ') : '');
        if (fields.handle) row.push(p?.person?.social_media_accounts?.handle ?? '');
        if (fields.profileURL) row.push(p?.person?.social_media_accounts?.profile_url ?? '');
        if (fields.isPrimaryAccount) row.push(p?.person?.social_media_accounts?.is_primary_account ?? '');

        // Affiliations
        if (fields.organizationName) row.push(p?.person?.affiliations?.organization_name ?? '');
        if (fields.roleorPosition) row.push(p?.person?.affiliations?.role_or_position ?? '');
        if (fields.affiliationStartDate) row.push(p?.person?.affiliations?.affiliation_start_date ?? '');
        if (fields.affiliationEndDate) row.push(p?.person?.affiliations?.affiliation_end_date ?? '');
        if (fields.affiliationType) row.push(p?.person?.affiliations?.affiliation_type ?? '');
        if (fields.description) row.push(p?.person?.affiliations?.description ?? '');

        // Diagnoses
        if (fields.healthCondition) row.push(p?.person?.diagnoses?.health_condition ?? '');
        if (fields.healthConditionCategory) row.push(p?.person?.diagnoses?.health_condition_category ?? '');
        if (fields.diagnosisDate) row.push(p?.person?.diagnoses?.diagnosis_date ?? '');
        if (fields.treatmentPlan) row.push(p?.person?.diagnoses?.treatment_plan ?? '');

        // Media Requirements
        if (fields.requirementsName) row.push(p?.person?.media_requirements?.name ?? '');
        if (fields.requirementIssuedBy) row.push(p?.person?.media_requirements?.issued_by ?? '');
        if (fields.requirementDateIssued) row.push(p?.person?.media_requirements?.date_issued ?? '');
        if (fields.requirementExpiryDate) row.push(p?.person?.media_requirements?.expiry_date ?? '');
        if (fields.requirementPlaceIssued) row.push(p?.person?.media_requirements?.place_issued ?? '');
        if (fields.requirementStatus) row.push(p?.person?.media_requirements?.status ?? '');

        //Media Identifiers
        if (fields.mediaIdentityIdNumber) row.push(p?.person?.media_identifiers?.id_number ?? '');
        if (fields.mediaIdentityIssuedBy) row.push(p?.person?.media_identifiers?.issued_by ?? '');
        if (fields.mediaIdentityDateIssued) row.push(p?.person?.media_identifiers?.date_issued ?? '');
        if (fields.mediaIdentityExpiryDate) row.push(p?.person?.media_identifiers?.expiry_date ?? '');
        if (fields.mediaIdentityPlaceIssued) row.push(p?.person?.media_identifiers?.place_issued ?? '');
        if (fields.mediaIdentityStatus) row.push(p?.person?.media_identifiers?.status ?? '');
        if (fields.mediaIdentityIDType) row.push(p?.person?.media_identifiers?.id_type ?? '');
            body.push(row);
        });

        return { headers, body };
        };

    export const buildAffiliationReport = (affiliation: any, fields: any,) => {
        const headers: string[] = [];
        const body: any[][] = [];
        if (fields.affiliationType) headers.push('Affiliation Type');
        if (fields.description) headers.push('Description');

        affiliation.forEach((a, i) => {
            const row = [i + 1];
            if (fields.affiliationType) row.push(a?.affiliation_type ?? '');
            if (fields.description) row.push(a?.description ?? '');
            body.push(row);
        });

        return { headers, body };
    }