import React from 'react';

interface FieldSelectorProps {
  selectedType: string;
  selectAllFields: boolean;
  handleSelectAllCheckbox: (checked: boolean) => void;
  handleFieldChange: (field: string) => void;
  visitorFields: Record<string, boolean>;
  personnelFields: Record<string, boolean>;
  pdlFields: Record<string, boolean>;
  affiliationFields: Record<string, boolean>;

  //gender and status filters
  selectedGender: string;
  setSelectedGender: (gender: string) => void;
  selectedStatus: string;
  setSelectedStatus: (status: string) => void;

  //showsfields
  showEmploymentFields: boolean;
  setShowEmploymentFields: (show: boolean) => void;
  showIdentifierFields: boolean;
  setShowIdentifierFields: (show: boolean) => void;
  showContactFields: boolean;
  setShowContactFields: (show: boolean) => void;
  showTalentsFields: boolean;
  setShowTalentsFields: (show: boolean) => void;
  showOtherPersonnelFields: boolean;
  setShowOtherPersonnelFields: (show: boolean) => void;
  showOtherVisitorFields?: boolean;
  setShowOtherVisitorFields?: (show: boolean) => void;
  showAddressFields?: boolean;
  setShowAddressFields?: (show: boolean) => void;
  showEducationalFields?: boolean;
  setShowEducationalFields?: (show: boolean) => void;
  showOtherPDLFields?: boolean;
  setShowOtherPDLFields?: (show: boolean) => void;
  showSocialMediaFields?: boolean;
  setShowSocialMediaFields?: (show: boolean) => void;
  showAffiliationFields?: boolean;
  setShowAffiliationFields?: (show: boolean) => void;
  showDiagnosesFields?: boolean;
  setShowDiagnosesFields?: (show: boolean) => void;
  showMediaRequirementsFields?: boolean;
  setShowMediaRequirementsFields?: (show: boolean) => void;
  showMediaIdentifiersFields?: boolean;
  setShowMediaIdentifiersFields?: (show: boolean) => void;
  showMultipleBirthSiblingFields?: boolean;
  setShowMultipleBirthSiblingFields?: (show: boolean) => void;
  showFamilyRecordFields?: boolean;
  setShowFamilyRecordFields?: (show: boolean) => void;
  showCaseFields?: boolean;
  setShowCaseFields?: (show: boolean) => void;
  showOffenseFields?: boolean;
  setShowOffenseFields?: (show: boolean) => void;
  showCourtBranchFields?: boolean;
  setShowCourtBranchFields?: (show: boolean) => void;
  showOtherCaseFields?: boolean;
  setShowOtherCaseFields?: (show: boolean) => void;
  showJailFields: boolean;
  setShowJailFields: ( show: boolean) => void;
  showVisitorFields: boolean;
  setShowVisitorFields: ( show: boolean) => void;
  showCellFields: boolean;
  setShowCellFields: ( show: boolean) => void;
}

const FieldSelector: React.FC<FieldSelectorProps> = ({
  selectedType,
  selectAllFields,
  handleSelectAllCheckbox,
  handleFieldChange,
  visitorFields,
  personnelFields,
  pdlFields,
  affiliationFields,
  selectedGender,
  setSelectedGender,
  selectedStatus,
  setSelectedStatus,
  showEmploymentFields,
  setShowEmploymentFields,
  showIdentifierFields,
  setShowIdentifierFields,
  showContactFields,
  setShowContactFields,
  showTalentsFields,
  setShowTalentsFields,
  showOtherPersonnelFields,
  setShowOtherPersonnelFields,
  showOtherVisitorFields = false,
  setShowOtherVisitorFields = () => {},
  showAddressFields = false,
  setShowAddressFields = () => {},
  showEducationalFields = false,
  setShowEducationalFields = () => {},
  showOtherPDLFields = false,
  setShowOtherPDLFields = () => {},
  showSocialMediaFields = false,
  setShowSocialMediaFields = () => {},
  showAffiliationFields = false,
  setShowAffiliationFields = () => {},
  showDiagnosesFields = false,
  setShowDiagnosesFields = () => {},
  showMediaRequirementsFields = false,
  setShowMediaRequirementsFields = () => {},
  showMediaIdentifiersFields = false,
  // setShowMediaIdentifiersFields = () => {},
  // showMultipleBirthSiblingFields = false,
  // setShowMultipleBirthSiblingFields = () => {},
  // showFamilyRecordFields = false,
  // setShowFamilyRecordFields = () => {},
  showCaseFields = false,
  setShowCaseFields = () => {},
  showOffenseFields = false,
  setShowOffenseFields = () => {},
  showCourtBranchFields = false,
  setShowCourtBranchFields = () => {},
  showOtherCaseFields = false,
  setShowOtherCaseFields = () => {},
  showJailFields = false,
  setShowJailFields = () => {},
  showVisitorFields = false,
  setShowVisitorFields = () => {},
  showCellFields = false,
  setShowCellFields = () => {},
}) => (
  <fieldset className="border border-gray-300 rounded-md p-4">
    <div className="mb-2 flex gap-2">
      <div className="mb-2 flex gap-2 items-center">
        <input
          type="checkbox"
          id="selectAllFields"
          checked={selectAllFields}
          onChange={e => handleSelectAllCheckbox(e.target.checked)}
          className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
        />
        <label htmlFor="selectAllFields" className="font-medium text-gray-700 cursor-pointer">
          Select All Fields
        </label>
      </div>
    </div>
    <div className="flex flex-wrap gap-4">
      {/* Visitor & Personnel Information */}
      {(selectedType === 'visitor' || selectedType === 'personnel') && (
        <div className="w-full mt-4">
          <span className="block font-semibold text-gray-700 mb-2">Personal Information</span>
          {[
            'registrationNo',
            // 'ID',
            // 'shortName',
            // 'firstName',
            // 'middleName',
            // 'lastName',
            'name',
            'gender',
            'dateOfBirth',
            'civilStatus',
            'religion',
            'fullAddress',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  registrationNo: 'Registration No',
                  // ID: 'ID Number',
                  // shortName: 'Short Name',
                  // firstName: 'First Name',
                  // middleName: 'Middle Name',
                  // lastName: 'Last Name',
                  name: 'Full Name',
                  gender: 'Gender',
                  dateOfBirth: 'Date of Birth',
                  civilStatus: 'Civil Status',
                  religion: 'Religion',
                  fullAddress: 'Address',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* PDL Information */}
      {selectedType === 'pdl' && (
        <div className="w-full mt-4">
          <span className="block font-semibold text-gray-700 mb-2">PDL Information</span>
          {[
            // 'ID',
            // 'shortName',
            // 'firstName',
            // 'middleName',
            // 'lastName',
            'name',
            'gender',
            'status',
            'dateOfBirth',
            'placeOfBirth',
            'civilStatus',
            'religion',
            'fullAddress',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  // ID: 'ID Number',
                  // shortName: 'Short Name',
                  // firstName: 'First Name',
                  // middleName: 'Middle Name',
                  // lastName: 'Last Name',
                  name: 'Full Name',
                  gender: 'Gender',
                  status: 'Status',
                  dateOfBirth: 'Date of Birth',
                  placeOfBirth: 'Place of Birth',
                  civilStatus: 'Civil Status',
                  religion: 'Religion',
                  fullAddress: 'Address',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Place this row above your field groups */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && (
        <>
        <div className="flex flex-wrap gap-2">
          {/* <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showAddressFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowAddressFields(!showAddressFields)}
          >
            {showAddressFields ? '' : ''} Address
          </button> */}
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showContactFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowContactFields(!showContactFields)}
          >
            {showContactFields ? '' : ''} Contact Information
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showEducationalFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowEducationalFields(!showEducationalFields)}
          >
            {showEducationalFields ? '' : ''} Educational Background
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showTalentsFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowTalentsFields(!showTalentsFields)}
          >
            {showTalentsFields ? '' : ''} Talents & Interests
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showIdentifierFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowIdentifierFields(!showIdentifierFields)}
          >
            {showIdentifierFields ? '' : ''} Identifier
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showEmploymentFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowEmploymentFields(!showEmploymentFields)}
          >
            {showEmploymentFields ? '' : ''} Employment History
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showSocialMediaFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowSocialMediaFields(!showSocialMediaFields)}
          >
            {showSocialMediaFields ? '' : ''} Social Media
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showAffiliationFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowAffiliationFields(!showAffiliationFields)}
          >
            {showAffiliationFields ? '' : ''} Affiliation
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showDiagnosesFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowDiagnosesFields(!showDiagnosesFields)}
          >
            {showDiagnosesFields ? '' : ''} Diagnoses
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showMediaRequirementsFields
                ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                : 'bg-[#1E365D] text-white'}
            `}
            onClick={() => setShowMediaRequirementsFields(!showMediaRequirementsFields)}
          >
            {showMediaRequirementsFields ? '' : ''} Media Requirements
          </button>
          {selectedType === 'personnel' && (
            <button
              type="button"
              className={`px-3 py-1 rounded font-semibold transition-colors
                ${showOtherPersonnelFields
                  ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                  : 'bg-[#1E365D] text-white'}
              `}
              onClick={() => setShowOtherPersonnelFields(!showOtherPersonnelFields)}
            >
              {showOtherPersonnelFields ? '' : ''} Other Personnel Information
            </button>
          )}
          {selectedType === 'visitor' && (
            <button
              type="button"
              className={`px-3 py-1 rounded font-semibold transition-colors
                ${showOtherVisitorFields
                  ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                  : 'bg-[#1E365D] text-white'}
              `}
              onClick={() => setShowOtherVisitorFields(!showOtherVisitorFields)}
            >
              {showOtherVisitorFields ? '' : ''} Other Visitor Information
            </button>
          )}
        </div>
        <div className='flex flex-col gap-2 mb-4'>
          {selectedType === 'pdl' && (
            <div className='flex flex-wrap gap-2 mb-4'>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showOtherPDLFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowOtherPDLFields(!showOtherPDLFields)}
              >
                Other Information
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showJailFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowJailFields(!showJailFields)}
              >
                Jail
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showCellFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowCellFields(!showCellFields)}
              >
                Cell
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showVisitorFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowVisitorFields(!showVisitorFields)}
              >
                Visitor
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showCaseFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowCaseFields(!showCaseFields)}
              >
                Case Information
              </button>
            </div>
          )}
        {/* Show Offense and Court Branch toggles only if Case Information is shown and selectedType is 'pdl' */}
          {selectedType === 'pdl' && showCaseFields && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showOffenseFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowOffenseFields(!showOffenseFields)}
              >
                {showOffenseFields ? 'Hide' : 'Show'} Offense Information
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showCourtBranchFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowCourtBranchFields(!showCourtBranchFields)}
              >
                {showCourtBranchFields ? 'Hide' : 'Show'} Court Branch Information
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showOtherCaseFields
                    ? 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'
                    : 'bg-[#1E365D] text-white'}
                `}
                onClick={() => setShowOtherCaseFields(!showOtherCaseFields)}
              >
                {showOtherCaseFields ? 'Hide' : 'Show'} Other Case Details
              </button>
            </div>
          )}
        </div>
        
        </>
      )}
      {/* Address
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showAddressFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Addresses</span>
          {[
            'addressType',
            'barangay',
            'bldg_subdivision',
            'country',
            'fullAddress',
            'isActive',
            'isCurrent',
            'municipality',
            'province',
            'street',
            'postalCode',
            'region',
            'streetNumber',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  addressType: 'Address Type',
                  barangay: 'Barangay',
                  bldg_subdivision: 'Building/Subdivision',
                  country: 'Country',
                  fullAddress: 'Full Address',
                  isActive: 'Is Active',
                  isCurrent: 'Is Current',
                  municipality: 'Municipality',
                  province: 'Province',
                  street: 'Street',
                  postalCode: 'Postal Code',
                  region: 'Region',
                  streetNumber: 'Street Number',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )} */}
      {/* Contact Information */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showContactFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Contact Information</span>
          {['contactType', 'value', 'mobileImei'].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    :selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  contactType: 'Contact Type',
                  value: 'Value',
                  mobileImei: 'Mobile IMEI',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Educational Background */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showEducationalFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Educational Background</span>
          {[
            'educationalAttainment',
            'institutionName',
            'degree',
            'fieldOfStudy',
            'startYear',
            'endYear',
            'highestLevel',
            'institutionAddress',
            'honorsRecieved'
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                    // : personnelFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  educationalAttainment: 'Educational Attainment',
                  institutionName: 'Institution Name',
                  degree: 'Degree',
                  fieldOfStudy: 'Field of Study',
                  startYear: 'Start Year',
                  endYear: 'End Year',
                  highestLevel: 'Highest Level',
                  institutionAddress: 'Institution Address',
                  honorsRecieved: 'Honors Received',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Talents & Interests */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showTalentsFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Talents & Interests</span>
          {['talents', 'skills', 'interests', 'sports', 'musicalInstruments'].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  talents: 'Talents',
                  skills: 'Skills',
                  interests: 'Interests',
                  sports: 'Sports',
                  musicalInstruments: 'Musical Instruments',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Identifier Fields */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showIdentifierFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Identifiers</span>
          {[
            'identifierType',
            'identifierIDNumber',
            'identifierIssuedBy',
            'identifierDateIssued',
            'identifierExpiryDate',
            'identifiersPlaceIssued'
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  identifierType: 'Identifier Type',
                  identifierIDNumber: 'Identifier ID Number',
                  identifierIssuedBy: 'Identifier Issued By',
                  identifierDateIssued: 'Identifier Date Issued',
                  identifierExpiryDate: 'Identifier Expiry Date',
                  identifiersPlaceIssued: 'Identifiers Place Issued',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Employment History */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showEmploymentFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Employment History</span>
          {[
            'employmentName',
            'jobTitle',
            'employmentType',
            'startDate',
            'endDate',
            'location',
            'responsibilities'
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  employmentName: 'Employment Name',
                  jobTitle: 'Job Title',
                  employmentType: 'Employment Type',
                  startDate: 'Start Date',
                  endDate: 'End Date',
                  location: 'Location',
                  responsibilities: 'Responsibilities'
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Social Media */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showSocialMediaFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Social Media</span>
          {[
            'platform',
            'handle',
            'profileLink',
            'isPrimaryAccount',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  platform: 'Platform',
                  handle: 'Handle',
                  profileLink: 'Profile Link',
                  isPrimaryAccount: 'Is Primary Account',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Affiliation */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showAffiliationFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Affiliatiob</span>
          {[
            'organizationName',
            'roleorPosition',
            'affiliationStartDate',
            'affiliationEndDate',
            'description',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  organizationName: 'Organization Name',
                  roleorPosition: 'Role/Position',
                  affiliationStartDate: 'Affiliation Start Date',
                  affiliationEndDate: 'Affiliation End Date',
                  description: 'Description',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Diagnoses */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showDiagnosesFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Diagnoses</span>
          {[
            'healthCondition',
            'healthConditionCategory',
            'diagnosisDate',
            'treatmentPlan',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  healthCondition: 'Health Condition',
                  healthConditionCategory: 'Health Condition Category',
                  diagnosisDate: 'Diagnosis Date',
                  treatmentPlan: 'Treatment Plan',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Media Requirements */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showMediaRequirementsFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Media Requirements</span>
          {[
            'requirementsName',
            'requirementIssuedBy',
            'requirementDateIssued',
            'requirementExpiryDate',
            'requirementPlaceIssued',
            'requirementStatus',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  requirementsName: 'Requirements Name',
                  requirementIssuedBy: 'Requirement Issued By',
                  requirementDateIssued: 'Requirement Date Issued',
                  requirementExpiryDate: 'Requirement Expiry Date',
                  requirementPlaceIssued: 'Requirement Place Issued',
                  requirementStatus: 'Requirement Status',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Media Identifiers */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showMediaIdentifiersFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Media Requirements</span>
          {[
            'mediaIdentityIdNumber',
            'mediaIdentityIssuedBy',
            'mediaIdentityDateIssued',
            'mediaIdentityExpiryDate',
            'mediaIdentifiersPlaceIssued',
            'mediaIdentityStatus',
            'mediaIdentityIDType',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={
                  selectedType === 'visitor'
                    ? visitorFields[field]
                    : selectedType === 'personnel'
                    ? personnelFields[field]
                    : pdlFields[field]
                }
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  mediaIdentityIdNumber: 'Media Identity ID Number',
                  mediaIdentityIssuedBy: 'Media Identity Issued By',
                  mediaIdentityDateIssued: 'Media Identity Date Issued',
                  mediaIdentityExpiryDate: 'Media Identity Expiry Date',
                  mediaIdentifiersPlaceIssued: 'Media Identifiers Place Issued',
                  mediaIdentityStatus: 'Media Identity Status',
                  mediaIdentityIDType: 'Media Identity ID Type',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}


      {/* Visitor Other Information Group */}
      {selectedType === 'visitor' && showOtherVisitorFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Other Visitor Information</span>
          {[
            'type',
            'biometricStatus',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visitorFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  type: 'Visitor Type',
                  biometricStatus: 'Biometric Status',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Personnel Other Information Group */}
      {selectedType === 'personnel' && showOtherPersonnelFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Other Personnel Information</span>
          {[
            'role',
            'personnelType',
            'position',
            'rank',
            'status',
            'personnelAppStatus',
            'ambition',
            'principle',
            'designation',
            'dateJoined',
            'biometricStatus',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={personnelFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  role: 'Role',
                  personnelType: 'Personnel Type',
                  position: 'Position',
                  rank: 'Rank',
                  status: 'Status',
                  personnelAppStatus: 'Personnel Application Status',
                  ambition: 'Ambition',
                  principle: 'Principle',
                  designation: 'Designation',
                  dateJoined: 'Date Joined',
                  biometricStatus: 'Biometric Status',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* PDL Other Information Group */}
      {selectedType === 'pdl' && showOtherPDLFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Other Information</span>
          {[
            'biometricStatus',
            'visitationStatus',
            'gangAffiliation',
            'look',
            'occupation',
            'precinct',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  biometricStatus: 'Biometrics Status',
                  visitationStatus: 'Visitation Status',
                  gangAffiliation: 'Gang Affiliation',
                  look: 'Look',
                  occupation: 'Occupation',
                  precinct: 'Precinct',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* PDL Offense */}
      {selectedType === 'pdl' && showOffenseFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Offense</span>
          {[
            'offense',
            'crimeCategory',
            'law',
            'crimeSeverity',
            'punishment',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  offense: 'Offense',
                  crimeCategory: 'Crime Category',
                  law: 'Law',
                  crimeSeverity: 'Crime Severity',
                  punishment: 'Punishment',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* PDL Court Branch */}
      {selectedType === 'pdl' && showCourtBranchFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Court Branch</span>
          {[
            'court',
            'branch',
            'judge',
            'courtProvince',
            'courtRegion',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  court: 'Court',
                  branch: 'Branch',
                  judge: 'Judge',
                  courtProvince: 'Court Province',
                  courtRegion: 'Court Region',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* PDL Other Case Details */}
      {selectedType === 'pdl' && showOtherCaseFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Other Case Details</span>
          {[
            'bailRecommended',
            'fileNumber',
            'caseNumber',
            'dateCrimeCommitted',
            'dateCommitted',
            'caseName',
            'caseStatus',
            'sentenceLength',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  bailRecommended: 'Bail Recommended',
                  fileNumber: 'File Number',
                  caseNumber: 'Case Number',
                  dateCrimeCommitted: 'Date Crime Committed',
                  dateCommitted: 'Date Committed',
                  caseName: 'Case Name',
                  caseStatus: 'Case Status',
                  sentenceLength: 'Sentence Length'
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Jail */}
      {selectedType === 'pdl' && showJailFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Jail</span>
          {[
            'jailName',
            'jailType',
            'jailCategory',
            'emailAddress',
            'contactNumber',
            'jailAddress',
            'securityLevel',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  jailName: 'Jail Name',
                  jailType: 'Jail Type',
                  jailCategory: 'Jail Category',
                  emailAddress: 'Email Address',
                  contactNumber: 'Contact Number',
                  jailAddress: 'Jail Address',
                  securityLevel: 'Security Level',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Jail */}
      {selectedType === 'pdl' && showCellFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Jail</span>
          {[
            'cellName',
            'cellCapacity',
            'cellStatus',
            'floor',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  cellName: 'Dorm Name',
                  cellCapacity: 'Dorm Capacity',
                  cellStatus: 'Dorm Status',
                  floor: 'Floor',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Visitor */}
      {selectedType === 'pdl' && showVisitorFields && (
        <div className="w-full">
          <span className="block font-semibold text-gray-700 mb-2">Visitor</span>
          {[
            'registrationNo',
            'visitor',
            'visitorType',
            'requirement',
            'remarks'
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pdlFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  registrationNo: 'Registration No.',
                  visitor: 'Visitor',
                  visitorType: 'Visitor Type',
                  requirement: 'Requirement',
                  remarks: 'Remarks'
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* Affiliation Fields Group */}
      {selectedType === 'affiliation' && (
        <div className="w-full mt-4">
          <span className="block font-semibold text-gray-700 mb-2">Affiliation Fields</span>
          {['affiliationType', 'description'].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={affiliationFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  affiliationType: 'Affiliation Type',
                  description: 'Description'
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}

    </div>
    {/* Gender Filter */}
    {(selectedType === 'visitor' && visitorFields.gender) ||
    (selectedType === 'personnel' && personnelFields.gender) ||
    (selectedType === 'pdl' && pdlFields.gender) ? (
      <div className="mt-2">
        <label className="text-gray-700 font-semibold mr-2">
          Filter {selectedType === 'visitor' ? 'Visitor' : selectedType === 'personnel' ? 'Personnel' : 'PDL'} by Gender:
        </label>
        <select
          className="border rounded px-2 py-1"
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
        >
          <option value="">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="lgbtq + transgender">LGBTQ + TRANSGENDER</option>
          <option value="lgbtq + gay / bisexual">LGBTQ + GAY / BISEXUAL</option>
          <option value="lgbtq + lesbian / bisexual">LGBTQ + LESBIAN / BISEXUAL</option>
        </select>
      </div>
    ) : null}
    {/*Personnel Status Filter */}
    {(selectedType === 'personnel' && personnelFields.status) ? (
      <div className="mt-2">
        <label className="text-gray-700 font-semibold mr-2">
          Filter Personnel by Status:
        </label>
        <select
          className="border rounded px-2 py-1"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="on duty">On Duty</option>
          <option value="off duty">Off Duty</option>
        </select>
      </div>
    ) : null}

    {/*PDL Status Filter */}
    {(selectedType === 'pdl' && pdlFields.status) ? (
      <div className="mt-2">
        <label className="text-gray-700 font-semibold mr-2">
          Filter PDL by Status:
        </label>
        <select
          className="border rounded px-2 py-1"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="committed">Committed</option>
          <option value="convicted">Convicted</option>
          <option value="released">Released</option>
          <option value="hospitalized">Hospitalized</option>
        </select>
      </div>
    ) : null}
    
  </fieldset>
);

export default FieldSelector;