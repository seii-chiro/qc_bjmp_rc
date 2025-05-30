
interface FieldSelectorProps {
  selectedType: string;
  selectAllFields: boolean;
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
  // showContactFields: boolean;
  // setShowContactFields: (show: boolean) => void;
  showTalentsFields: boolean;
  setShowTalentsFields: (show: boolean) => void;
  showOtherPersonnelFields: boolean;
  setShowOtherPersonnelFields: (show: boolean) => void;
  showOtherVisitorFields?: boolean;
  setShowOtherVisitorFields?: (show: boolean) => void;
  // showAddressFields?: boolean;
  // setShowAddressFields?: (show: boolean) => void;
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
  // selectAllFields,
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
  // showContactFields,
  // setShowContactFields,
  showTalentsFields,
  setShowTalentsFields,
  showOtherPersonnelFields,
  setShowOtherPersonnelFields,
  showOtherVisitorFields = false,
  setShowOtherVisitorFields = () => {},
  // showAddressFields = false,
  // setShowAddressFields = () => {},
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
  setShowMediaIdentifiersFields = () => {},
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
  <div>
  <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
  {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && (
    <>
  <fieldset className="border col-span-1 border-gray-300 rounded-md p-4 h-fit">
    {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && (
  <legend className='px-2'>Personal Information</legend>
)}
    <div className="flex flex-wrap gap-4">
      {/* Visitor & Personnel Information */}
      {(selectedType === 'visitor' || selectedType === 'personnel') && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-1">
          {[
            'registrationNo',
            // 'ID',
            // 'shortName',
            // 'firstName',
            // 'middleName',
            // 'lastName',
            'name',
            'age',
            'gender',
            'dateOfBirth',
            'placeOfBirth',
            'civilStatus',
            'religion',
            'fullAddress',
            'value',
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
                className="form-checkbox accent-[#1E365D] h-5 w-5 text-[#1E365D] border-[#1E365D]"
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
                  age: 'Age',
                  gender: 'Gender',
                  dateOfBirth: 'Date of Birth',
                  placeOfBirth: 'Place of Birth',
                  civilStatus: 'Civil Status',
                  religion: 'Religion',
                  fullAddress: 'Address',
                  value: 'Mobile Number',
                }[field]}
              </span>
            </label>
          ))}
        </div>
      )}
      {/* PDL Information */}
      {selectedType === 'pdl' && (
        <div className="w-full grid grid-cols-1 md:grid-cols-2">
          {[
            // 'ID',
            // 'shortName',
            // 'firstName',
            // 'middleName',
            // 'lastName',
            'name',
            'age',
            'gender',
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
                className="form-checkbox h-5 w-5 accent-[#1E365D] text-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  // ID: 'ID Number',
                  // shortName: 'Short Name',
                  // firstName: 'First Name',
                  // middleName: 'Middle Name',
                  // lastName: 'Last Name',
                  name: 'Full Name',
                  age: 'Age',
                  gender: 'Gender',
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
    </div>
     {/* Gender Filter */}
  {(selectedType === 'visitor' && visitorFields.gender) ||
  (selectedType === 'personnel' && personnelFields.gender) ||
  (selectedType === 'pdl' && pdlFields.gender) ? (
    <div className="mt-4">
      <label className="text-gray-700 font-semibold mr-2 block">
        Filter {selectedType === 'visitor' ? 'Visitor' : selectedType === 'personnel' ? 'Personnel' : 'PDL'} by Gender:
      </label>
      <select
        className="w-full border rounded px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E365D] focus:border-transparent"
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
        <label className="text-gray-700 font-semibold mr-2 block">
          Filter Personnel by Status:
        </label>
        <select
          className="w-full border rounded px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E365D] focus:border-transparent"
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
        <label className="text-gray-700 font-semibold mr-2 block">
          Filter PDL by Status:
        </label>
        <select
          className="w-full border rounded px-3 py-2 mt-1 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1E365D] focus:border-transparent"
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
  <fieldset className="border col-span-2 border-gray-300 grid grid-cols-1 md:grid-cols-3 rounded-md p-4">
    {/* Place this row above your field groups */}
    <legend className='px-2'>Additional Information</legend>
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && (
        <>
        <div className='grid col-span-1 border-r-2 pr-4 gap-1 border-gray-400'>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showEducationalFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowEducationalFields(!showEducationalFields);
              setShowTalentsFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false);
            }}
          >
            {showEducationalFields ? '' : ''} Educational Background
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showTalentsFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowTalentsFields(!showTalentsFields);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false);
            }}
          >
            {showTalentsFields ? '' : ''} Talents & Interests
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showIdentifierFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowIdentifierFields(!showIdentifierFields)
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false);

            }}
          >
            {showIdentifierFields ? '' : ''} Identifier
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showEmploymentFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowEmploymentFields(!showEmploymentFields)
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false);
            }}
          >
            {showEmploymentFields ? '' : ''} Employment History
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showSocialMediaFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowSocialMediaFields(!showSocialMediaFields)
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false)
            }}
          >
            {showSocialMediaFields ? '' : ''} Social Media
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showAffiliationFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowAffiliationFields(!showAffiliationFields)
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowDiagnosesFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false);
            }}
          >
            {showAffiliationFields ? '' : ''} Affiliation
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showDiagnosesFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowDiagnosesFields(!showDiagnosesFields)
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowMediaRequirementsFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
              setShowJailFields(false);
              setShowCellFields(false);
            }}
          >
            {showDiagnosesFields ? '' : ''} Diagnoses
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showMediaRequirementsFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowMediaRequirementsFields(!showMediaRequirementsFields);
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowOtherPersonnelFields(false);
              setShowMediaIdentifiersFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
            }}
          >
            {showMediaRequirementsFields ? '' : ''} Media Requirements
          </button>
          <button
            type="button"
            className={`px-3 py-1 rounded font-semibold transition-colors
              ${showMediaIdentifiersFields
                ? 'bg-[#1E365D] text-white'
                : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
            `}
            onClick={() => {
              setShowMediaIdentifiersFields(!showMediaIdentifiersFields);
              setShowMediaRequirementsFields(false);
              setShowTalentsFields(false);
              setShowEducationalFields(false);
              setShowIdentifierFields(false);
              setShowEmploymentFields(false);
              setShowSocialMediaFields(false);
              setShowAffiliationFields(false);
              setShowDiagnosesFields(false);
              setShowOtherPersonnelFields(false);
              setShowOtherVisitorFields(false);
              setShowOtherPDLFields(false);
              setShowCaseFields(false);
              setShowOffenseFields(false);
              setShowCourtBranchFields(false);
              setShowOtherCaseFields(false);
            }}
          >
            {showMediaIdentifiersFields ? '' : ''} Media Identifier
          </button>
          {selectedType === 'personnel' && (
            <button
              type="button"
              className={`px-3 py-1 rounded font-semibold transition-colors
                ${showOtherPersonnelFields
                  ? 'bg-[#1E365D] text-white'
                  : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
              `}
              onClick={() => {
                setShowOtherPersonnelFields(!showOtherPersonnelFields);
                setShowTalentsFields(false);
                setShowEducationalFields(false);
                setShowIdentifierFields(false);
                setShowEmploymentFields(false);
                setShowSocialMediaFields(false);
                setShowAffiliationFields(false);
                setShowDiagnosesFields(false);
                setShowMediaRequirementsFields(false);
                setShowCaseFields(false);
                setShowMediaIdentifiersFields(false);
                setShowOffenseFields(false);
                setShowCourtBranchFields(false);
                setShowOtherCaseFields(false);
              }}
            >
              {showOtherPersonnelFields ? '' : ''} Other Personnel Information
            </button>
          )}
          {selectedType === 'visitor' && (
            <button
              type="button"
              className={`px-3 py-1 rounded font-semibold transition-colors
                ${showOtherVisitorFields
                  ? 'bg-[#1E365D] text-white'
                  : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
              `}
              onClick={() => {
                setShowOtherVisitorFields(!showOtherVisitorFields)
                setShowTalentsFields(false);
                setShowEducationalFields(false);
                setShowIdentifierFields(false);
                setShowEmploymentFields(false);
                setShowSocialMediaFields(false);
                setShowAffiliationFields(false);
                setShowDiagnosesFields(false);
                setShowMediaRequirementsFields(false);
                setShowMediaIdentifiersFields(false);
                setShowCaseFields(false);
                setShowOffenseFields(false);
                setShowCourtBranchFields(false);
                setShowOtherCaseFields(false);
              }}
            >
              {showOtherVisitorFields ? '' : ''} Other Visitor Information
            </button>
          )}
          {selectedType === 'pdl' && (
            <div className='flex flex-col gap-1'>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showOtherPDLFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() => {
                  setShowOtherPDLFields(!showOtherPDLFields);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowMediaIdentifiersFields(false);
                  setShowCaseFields(false);
                  setShowOffenseFields(false);
                  setShowJailFields(false);
                  setShowCellFields(false);
                  setShowVisitorFields(false);
                  setShowCourtBranchFields(false);
                  setShowOtherCaseFields(false);
                }}
              >
                Other Information
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showJailFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() => {
                  setShowJailFields(!showJailFields);
                  setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowCaseFields(false);
                  setShowOffenseFields(false);
                  setShowCellFields(false);
                  setShowVisitorFields(false);
                  setShowCourtBranchFields(false);
                  setShowOtherCaseFields(false);}}
              >
                Jail
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showCellFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() => {
                  setShowCellFields(!showCellFields)
                  setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowCaseFields(false);
                  setShowOffenseFields(false);
                  setShowJailFields(false);
                  setShowVisitorFields(false);
                  setShowCourtBranchFields(false);
                  setShowOtherCaseFields(false);
                }}
              >
                Cell
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showVisitorFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() => {
                  setShowVisitorFields(!showVisitorFields);
                  setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowCaseFields(false);
                  setShowOffenseFields(false);
                  setShowJailFields(false);
                  setShowCellFields(false);
                  setShowCourtBranchFields(false);
                  setShowOtherCaseFields(false);
                }}
              >
                Visitor
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-semibold transition-colors
                  ${showCaseFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() => {
                  setShowCaseFields(!showCaseFields);
                setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowDiagnosesFields(false);
                  setShowOffenseFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowJailFields(false);
                  setShowCellFields(false);
                  setShowVisitorFields(false);
                }}
              >
                Case Information
              </button>
            </div>
          )}
        </div>
        </>
      )}
      {selectedType === 'pdl' && showCaseFields && (
            <div className='border-r-2 pr-4 space-y-1 h-fit gap-1 border-gray-400 ml-4'>
              <button
                type="button"
                className={`px-3 py-1 w-full rounded font-semibold transition-colors
                  ${showOffenseFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() =>{
                  setShowOffenseFields(!showOffenseFields);
                  setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowMediaIdentifiersFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowJailFields(false);
                  setShowCellFields(false);
                  setShowVisitorFields(false);
                  setShowCourtBranchFields(false);
                  setShowOtherCaseFields(false);
                }}
              >
                {showOffenseFields ? '' : ''} Offense Information
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded w-full font-semibold transition-colors
                  ${showCourtBranchFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() =>{
                  setShowCourtBranchFields(!showCourtBranchFields);
                  setShowOffenseFields(false);
                  setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowMediaIdentifiersFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowJailFields(false);
                  setShowCellFields(false);
                  setShowVisitorFields(false);
                  setShowOtherCaseFields(false);}}
              >
                {showCourtBranchFields ? '' : ''} Court Branch Information
              </button>
              <button
                type="button"
                className={`px-3 py-1 w-full rounded font-semibold transition-colors
                  ${showOtherCaseFields
                    ? 'bg-[#1E365D] text-white'
                    : 'bg-white text-[#1E365D] border-2 border-[#1E365D] shadow'}
                `}
                onClick={() => {
                  setShowOtherCaseFields(!showOtherCaseFields);
                  setShowOffenseFields(false);
                  setShowOtherPDLFields(false);
                  setShowTalentsFields(false);
                  setShowEducationalFields(false);
                  setShowIdentifierFields(false);
                  setShowEmploymentFields(false);
                  setShowSocialMediaFields(false);
                  setShowAffiliationFields(false);
                  setShowDiagnosesFields(false);
                  setShowMediaIdentifiersFields(false);
                  setShowMediaRequirementsFields(false);
                  setShowJailFields(false);
                  setShowCellFields(false);
                  setShowVisitorFields(false);
                  setShowCourtBranchFields(false);
                }}
              >
                {showOtherCaseFields ? '' : ''} Other Case Details
              </button>
            </div>
          )}
      {/* Educational Background */}
      {(selectedType === 'visitor' || selectedType === 'personnel' || selectedType === 'pdl') && showEducationalFields && (
        <div className="w-full flex flex-col col-span-2 gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Educational Background</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Talents & Interests</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Identifiers</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Employment History</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Social Media</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Affiliation</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Diagnoses</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Media Requirements</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Media Identifier</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Other Visitor Information</span>
          {[
            'type',
            'biometricStatus',
          ].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visitorFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Other Personnel Information</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Other Information</span>
          {[
            'status',
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
              />
              <span>
                {{
                  status: 'Status',
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Offense</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Court Branch</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Other Case Details</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Jail</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
      {/* Cell */}
      {selectedType === 'pdl' && showCellFields && (
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Cell</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
        <div className="w-full flex flex-col gap-1 ml-5">
          <span className="block font-bold text-[#1E365D] mb-2">Visitor</span>
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
                className="form-checkbox h-5 w-5 text-[#1E365D] accent-[#1E365D] border-[#1E365D]"
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
  </fieldset>
  </>
  )}
  </div>
  {selectedType === 'affiliation' && (
    <fieldset className="border border-gray-300 rounded-md p-4 mt-3">
    <legend className="block font-semibold text-gray-700 px-2">Affiliation Fields</legend>
        <div className="w-full mt-2">
          {['affiliationType', 'description'].map((field) => (
            <label key={field} className="inline-flex items-center gap-2 mr-4 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={affiliationFields[field]}
                onChange={() => handleFieldChange(field)}
                className="form-checkbox accent-[#1E365D] h-5 w-5 text-[#1E365D] border-[#1E365D]"
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
  </fieldset>
    )}
  </div>
);

export default FieldSelector;