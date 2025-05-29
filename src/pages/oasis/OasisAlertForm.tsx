import { OASISAlertFormType } from "@/lib/oasis-definitions";
import { getOASISCategories, getOASISCertainty, getOASISCodes, getOASISEventCodes, getOASISLanguages, getOASISMessageTypes, getOASISNotes, getOASISRestrictions, getOASISScopes, getOASISSeverity, getOASISStatus, getOASISUrgency } from "@/lib/oasis-query";
import "@/pages/oasis/oasisStyle.css";
import { useTokenStore } from "@/store/useTokenStore";
import { useQuery } from "@tanstack/react-query";
import { Input, Select } from "antd";
import { useState } from "react";

const { Option } = Select;

const OasisAlertForm = () => {
    const token = useTokenStore()?.token

    const [OASISAlertForm, setOASISAlertForm] = useState<OASISAlertFormType>({
        addresses: null,
        code: null,
        identifier: null,
        incidents: null,
        msg_type_id: null,
        note: null,
        references: null,
        restriction: null,
        scope_id: null,
        sender: null,
        sent: null,
        source: null,
        status_id: null,
        infos: [{
            alert_id: null,
            audience_id: null,
            category_id: null,
            certainty_id: null,
            contact: null,
            description: null,
            effective: null,
            event: null,
            event_code: null,
            expires: null,
            headline: null,
            instruction_id: null,
            language_id: null,
            onset: null,
            response_type_id: null,
            sender_name: null,
            severity_id: null,
            urgency_id: null,
            web: null,
            areas: [{
                altitude: null,
                area_desc: null,
                ceiling: null,
                circle: null,
                geocode: null,
                info_id: null,
                polygon: null,
            }],
        }]
    })
    const [searchInputs, setSearchInputs] = useState<{ [key: string]: string }>({});

    const { data: restrictions, isLoading: restrictionsLoading } = useQuery({
        queryKey: ['OASIS-CAP-Restriction'],
        queryFn: () => getOASISRestrictions(token ?? "")
    })

    const { data: status, isLoading: statusLoading } = useQuery({
        queryKey: ['OASIS-CAP-Status'],
        queryFn: () => getOASISStatus(token ?? "")
    })

    const { data: messageTypes, isLoading: messageTypesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Message-Types'],
        queryFn: () => getOASISMessageTypes(token ?? "")
    })

    const { data: codes, isLoading: codesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Codes'],
        queryFn: () => getOASISCodes(token ?? "")
    })

    const { data: notes, isLoading: notesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Notes'],
        queryFn: () => getOASISNotes(token ?? "")
    })

    const { data: eventCodes, isLoading: eventCodesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Event-Codes'],
        queryFn: () => getOASISEventCodes(token ?? "")
    })

    const { data: certainties, isLoading: certaintiesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Certainties'],
        queryFn: () => getOASISCertainty(token ?? "")
    })

    const { data: urgencies, isLoading: urgenciesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Urgencies'],
        queryFn: () => getOASISUrgency(token ?? "")
    })

    const { data: severities, isLoading: severitiesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Severities'],
        queryFn: () => getOASISSeverity(token ?? "")
    })

    const { data: categories, isLoading: categoriesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Categories'],
        queryFn: () => getOASISCategories(token ?? "")
    })

    const { data: languages, isLoading: languagesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Languages'],
        queryFn: () => getOASISLanguages(token ?? "")
    })

    const { data: scopes, isLoading: scopesLoading } = useQuery({
        queryKey: ['OASIS-CAP-Ccopes'],
        queryFn: () => getOASISScopes(token ?? "")
    })

    console.log(OASISAlertForm)

    return (
        <div className="container">
            <h1>OASIS CAP v1.2 Full Alert Form - Ver 02.00</h1>
            <form id="cap-form">
                <fieldset>
                    <legend>Alert Block</legend>
                    <small>
                        The <strong>Alert block</strong> is the root element of every CAP
                        message and contains the basic, high-level metadata about the alert.
                        It includes essential elements such as the alert identifier, sender,
                        time sent, message type, source, scope, and references. This block
                        is required and must appear exactly once per CAP message. It serves
                        as the container for one or more <code>&lt;info&gt;</code> blocks,
                        each of which contains detailed information in a specific language
                        or category.
                    </small>
                    <div className="form-group">
                        <label htmlFor="identifier">Identifier *</label>
                        <small>
                            A unique identifier for this alert message. This is a{" "}
                            <strong>required</strong> element and must be unique for each
                            message issued by the sender. It is used for message tracking,
                            updating, and cancellation purposes. The identifier should remain
                            consistent across updated or canceled versions of the same alert.
                            Format is agency-defined but typically includes alphanumeric
                            values (e.g., <code>BJMP20240528-001</code>).
                        </small>
                        <Input className="h-[2.625rem]" id="identifier" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sender">Sender *</label>
                        <small>Originator email or ID</small>
                        <Input className="h-[2.625rem]" id="sender" type="email" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="sent">Sent *</label>
                        <small>Time message sent (ISO 8601)</small>
                        <Input className="h-[2.625rem]" id="sent" type="datetime-local" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="status">Status *</label>
                        <small>
                            Indicates the nature of the alert message's source. This is a{" "}
                            <strong>required</strong> element in the{" "}
                            <code>&lt;alert&gt;</code> block. It describes whether the alert
                            is issued by an official source, an exercise, a test, or a system
                            message. Allowed values are:
                            <code>Actual</code> – A real situation is occurring or has
                            occurred.
                            <code>Exercise</code> – This message is part of a training
                            exercise.
                            <code>System</code> – This message is generated by an internal
                            system or technical process.
                            <code>Test</code> – This is a test message, not to be interpreted
                            as a real event.
                            <code>Draft</code> – Preliminary message for review; not yet
                            authorized for release.
                        </small>
                        <Select
                            value={OASISAlertForm?.status_id}
                            id="status"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Status"
                            loading={statusLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value => setOASISAlertForm(prev => ({ ...prev, status_id: value }))}
                        >
                            {status?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="msgType">Message Type *</label>
                        <small>
                            The code denoting the nature of the alert message. This is a{" "}
                            <strong>required</strong> element in the{" "}
                            <code>&lt;alert&gt;</code> block and defines the purpose of the
                            message within the alert lifecycle. Allowed values are:
                            <code>Alert</code> – Initial message requiring immediate
                            attention.
                            <code>Update</code> – Updates and replaces an earlier message.
                            <code>Cancel</code> – Cancels a previously issued message.
                            <code>Ack</code> – Acknowledges receipt and acceptance of a
                            message.
                            <code>Error</code> – Indicates rejection of a message due to
                            error. Each value supports different roles in automated processing
                            and communication workflows.
                        </small>
                        <Select
                            value={OASISAlertForm?.msg_type_id}
                            id="msgType"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Message Type"
                            loading={messageTypesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value => setOASISAlertForm(prev => ({ ...prev, msg_type_id: value }))}
                        >
                            {messageTypes?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="source">Source</label>
                        <small>
                            The text identifying the origin of the alert message or the
                            information it is based on. This element is optional in CAP v1.2
                            and may be used to provide additional context about where the
                            alert data originated, such as a sensor network, partner agency,
                            or field report. It helps increase the credibility and
                            traceability of the alert message. Example:{" "}
                            <code>DOST-PHIVOLCS Seismic Network</code> or{" "}
                            <code>Municipal DRRMO Field Report</code>
                        </small>
                        <Input className="h-[2.625rem]" id="source" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="scope">Scope *</label>
                        <small>
                            Defines the intended distribution of the alert message. This is a{" "}
                            <strong>required</strong> element in the{" "}
                            <code>&lt;alert&gt;</code> block and determines who is authorized
                            to view or act on the information. Allowed values are:
                            <code>Public</code> – The message is intended for unrestricted
                            public dissemination.
                            <code>Restricted</code> – The message is for a specific group or
                            audience, typically defined in the{" "}
                            <code>&lt;restriction&gt;</code> element.
                            <code>Private</code> – The message is for internal or limited
                            distribution, typically defined by the{" "}
                            <code>&lt;addresses&gt;</code> element. Proper setting of scope is
                            critical for message confidentiality and audience targeting.
                        </small>
                        <Select
                            value={OASISAlertForm?.scope_id}
                            id="scope"
                            className="w-full h-[2.625rem]"
                            placeholder="Select a Scope"
                            loading={scopesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    scope_id: value
                                }))
                            }
                        >
                            {scopes?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="restriction">Restriction</label>
                        <small>
                            Text describing the rule for restricting the distribution of the
                            alert message. This element is <strong>required</strong> if{" "}
                            <code>&lt;scope&gt;</code> is set to <code>Restricted</code>, and{" "}
                            <strong>optional</strong> otherwise. It should clearly define the
                            limitations on who can access or redistribute the message, such as
                            security classification, organizational access levels, or policy
                            restrictions. Example:{" "}
                            <code>
                                For official use only – distribute within government agencies
                            </code>
                        </small>
                        <Select
                            value={OASISAlertForm?.restriction}
                            id="restrictionDropdown"
                            className="w-full h-[2.625rem]"
                            placeholder="Select restriction or enter a custom restriction"
                            loading={restrictionsLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value => setOASISAlertForm(prev => ({ ...prev, restriction: value }))}
                            onSearch={(value) =>
                                setSearchInputs((prev) => ({ ...prev, restriction: value }))
                            }
                            onBlur={() => {
                                const typed = searchInputs["restriction"];
                                if (typed) {
                                    setOASISAlertForm((prev) => ({ ...prev, restriction: typed }));
                                    setSearchInputs((prev) => ({ ...prev, restriction: "" }));
                                }
                            }}
                        >
                            {restrictions?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.restriction_text}
                                    label={item?.restriction_text}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.restriction_text}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="addresses">Addresses</label>
                        <small>
                            The list of intended recipients for the alert message when the{" "}
                            <code>&lt;scope&gt;</code> is set to <code>Private</code>. This
                            element is <strong>required</strong> if{" "}
                            <code>scope = Private</code>, and <strong>optional</strong>{" "}
                            otherwise. It contains a space-separated list of identifiers (such
                            as email addresses, phone numbers, or system IDs) that specify the
                            authorized recipients. Example:{" "}
                            <code>mayor@city.gov governor@province.gov.ph</code>
                        </small>
                        <textarea id="addresses"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="code">Code</label>
                        <small>
                            A system-specific code that is relevant to the alert message. This
                            element is optional and allows inclusion of identifiers or tags
                            used by the issuing authority’s alerting system. It can support
                            routing, filtering, or categorization of alerts within internal
                            systems. Multiple <code>&lt;code&gt;</code> elements may be used
                            as needed. Example: <code>EAS</code> (Emergency Alert System) or{" "}
                            <code>NDRRMC-ALERT</code>
                        </small>
                        <Select
                            value={OASISAlertForm?.code}
                            id="codeDropdown"
                            className="w-full h-[2.625rem]"
                            placeholder="Select code or enter a custom code"
                            loading={codesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value => setOASISAlertForm(prev => ({ ...prev, code: value }))}
                            onSearch={(value) =>
                                setSearchInputs((prev) => ({ ...prev, code: value }))
                            }
                            onBlur={() => {
                                const typed = searchInputs["code"];
                                if (typed) {
                                    setOASISAlertForm((prev) => ({ ...prev, code: typed }));
                                    setSearchInputs((prev) => ({ ...prev, code: "" }));
                                }
                            }}
                        >
                            {codes?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.code}
                                    label={item?.code}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="note">Note</label>
                        <small>
                            An optional field for additional human-readable information that
                            does not fit in the structured elements of the alert. It may
                            include administrative comments, disclaimers, or supplementary
                            explanations intended for recipients or alert processors. This
                            element is not intended for instructions or critical alert
                            content. Example:{" "}
                            <code>
                                This alert was automatically generated by the regional
                                monitoring system.
                            </code>
                        </small>

                        <Select
                            value={OASISAlertForm?.note}
                            id="noteDropdown"
                            className="w-full h-[2.625rem]"
                            placeholder="Select note or enter a custom note"
                            loading={notesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value => setOASISAlertForm(prev => ({ ...prev, note: value }))}
                            onSearch={(value) =>
                                setSearchInputs((prev) => ({ ...prev, note: value }))
                            }
                            onBlur={() => {
                                const typed = searchInputs["note"];
                                if (typed) {
                                    setOASISAlertForm((prev) => ({ ...prev, note: typed }));
                                    setSearchInputs((prev) => ({ ...prev, notev: "" }));
                                }
                            }}
                        >
                            {notes?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.note_text}
                                    label={item?.note_text}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.note_text}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="references">References</label>
                        <small>
                            The message identifiers of earlier CAP messages related to this
                            alert. This element is optional and used when referencing previous
                            messages that are updated, superseded, or otherwise linked. Each
                            reference must include the sender, identifier, and sent time,
                            separated by commas. Multiple references can be included,
                            separated by spaces. Format: <code>sender,identifier,sent</code>
                            Example:{" "}
                            <code>
                                ndrrmc@ocd.gov.ph,ND20240527-001,2025-05-27T08:00:00+08:00
                            </code>
                        </small>
                        <textarea id="references"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="incidents">Incidents</label>
                        <small>
                            Used to associate the alert message with one or more known
                            incidents. This element is optional in CAP v1.2 and provides a way
                            to link the message to formal incident identifiers used by
                            emergency management systems. Multiple incident identifiers can be
                            included, separated by spaces. Example:{" "}
                            <code>INC2024-045 INC2024-046</code>
                        </small>
                        <Input className="h-[2.625rem]" id="incidents" />
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Info Block</legend>
                    <small>
                        The <strong>Info block</strong> provides detailed information about
                        the alert event in a specific language or for a specific category.
                        It includes critical details such as the event type, urgency,
                        severity, certainty, instructions, timing, and affected areas. A
                        single <code>&lt;alert&gt;</code> may contain multiple{" "}
                        <code>&lt;info&gt;</code> blocks to support multi-language or
                        multi-category alerts. Each <code>&lt;info&gt;</code> block must
                        include at least one <code>&lt;category&gt;</code> and{" "}
                        <code>&lt;event&gt;</code>, and either an <code>&lt;area&gt;</code>{" "}
                        or <code>&lt;resource&gt;</code> element.
                    </small>
                    <div className="form-group">
                        <label htmlFor="language">
                            Language <span style={{ color: "red" }}>*</span>
                        </label>
                        <small>
                            Specifies the language of the alert message. Should follow RFC
                            3066 format (e.g., en-US, fil-PH). Default is <code>en-US</code>{" "}
                            if not provided.
                        </small>
                        <Select
                            value={OASISAlertForm?.infos?.[0]?.language_id}
                            id="language"
                            className="w-full h-[2.625rem]"
                            placeholder="Select a Language"
                            loading={languagesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    infos: prev.infos
                                        ? [
                                            {
                                                ...prev.infos[0],
                                                language_id: value,
                                            },
                                            ...prev.infos.slice(1),
                                        ]
                                        : [],
                                }))
                            }
                        >
                            {languages?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.name} - {item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">Category *</label>
                        <small>
                            The code denoting the category of the subject event of the alert
                            message.
                        </small>
                        <Select
                            value={OASISAlertForm?.infos?.[0]?.category_id}
                            id="category"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Category"
                            loading={categoriesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    infos: prev.infos
                                        ? [
                                            {
                                                ...prev.infos[0],
                                                category_id: value,
                                            },
                                            ...prev.infos.slice(1),
                                        ]
                                        : [],
                                }))
                            }
                        >
                            {categories?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="event">Event *</label>
                        <small>
                            The text denoting the type of the subject event of the alert
                            message. This is a **required** field that provides a
                            human-readable label (e.g., "Flood", "Tsunami Warning",
                            "Evacuation Order") that identifies the specific hazard or
                            incident type. There are **no fixed values** for this field—it is
                            typically aligned with agency-specific vocabularies or local
                            hazard naming conventions.
                        </small>
                        <Select
                            value={OASISAlertForm?.code}
                            id="eventDropdown"
                            className="w-full h-[2.625rem]"
                            placeholder="Select event or enter a event code"
                            loading={eventCodesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value => setOASISAlertForm(prev => ({ ...prev, event: value }))}
                            onSearch={(value) =>
                                setSearchInputs((prev) => ({ ...prev, code: value }))
                            }
                            onBlur={() => {
                                const typed = searchInputs["code"];
                                if (typed) {
                                    setOASISAlertForm((prev) => ({ ...prev, code: typed }));
                                    setSearchInputs((prev) => ({ ...prev, code: "" }));
                                }
                            }}
                        >
                            {codes?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.code}
                                    label={item?.code}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>

                        <Input className="h-[2.625rem]"
                            type="text"
                            id="event"
                            name="event"
                            placeholder="Enter a custom event here"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="responseType">Response Type</label>
                        <small>
                            Specifies the type of action recommended for the target audience.
                            This element helps clarify the appropriate response to the alert
                            message. Standard values include:
                            <code>Shelter</code>, <code>Evacuate</code>, <code>Prepare</code>,{" "}
                            <code>Execute</code>, <code>Avoid</code>, <code>Monitor</code>,{" "}
                            <code>Assess</code>, <code>AllClear</code>, <code>None</code>.
                            Multiple values may be included if needed. This element is
                            optional in CAP v1.2.
                        </small>
                        <select
                            id="responseTypeDropdown"
                            onchange="document.getElementById('responseType').value=this.value"
                        >
                            <option value="">-- Select a Response Type --</option>
                            <option>Shelter</option>
                            <option>Evacuate</option>
                            <option>Prepare</option>
                            <option>Execute</option>
                            <option>Avoid</option>
                            <option>Monitor</option>
                            <option>Assess</option>
                            <option>AllClear</option>
                            <option>None</option>
                        </select>
                        <Input className="h-[2.625rem]"
                            type="text"
                            id="responseType"
                            name="responseType"
                            placeholder="Enter a custom response type here"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="urgency">Urgency *</label>
                        <small>
                            Indicates the speed with which the event is expected to impact the
                            target audience. This is a <strong>required</strong> element in
                            the <code>&lt;info&gt;</code> block. It helps prioritize the alert
                            based on time sensitivity. Allowed values are:
                            <code>Immediate</code> – Responsive action should be taken
                            immediately.
                            <code>Expected</code> – Responsive action should be taken soon
                            (within the next hour).
                            <code>Future</code> – Responsive action should be taken in the
                            near future.
                            <code>Past</code> – The event is no longer expected to be a
                            threat.
                            <code>Unknown</code> – Urgency is not known.
                        </small>
                        <Select
                            value={OASISAlertForm?.infos?.[0]?.urgency_id}
                            id="certainty"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Status"
                            loading={urgenciesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    infos: prev.infos
                                        ? [
                                            {
                                                ...prev.infos[0],
                                                urgency_id: value,
                                            },
                                            ...prev.infos.slice(1),
                                        ]
                                        : [],
                                }))
                            }
                        >
                            {urgencies?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="severity">Severity *</label>
                        <small>
                            Indicates the seriousness of the impact of the event described by
                            the alert message. This is a <strong>required</strong> element in
                            the <code>&lt;info&gt;</code> block. It helps determine the
                            potential consequences of the hazard. Allowed values are:
                            <code>Extreme</code> – Extraordinary threat to life or property.
                            <code>Severe</code> – Significant threat to life or property.
                            <code>Moderate</code> – Possible threat to life or property.
                            <code>Minor</code> – Minimal or no known threat to life or
                            property.
                            <code>Unknown</code> – Severity is not known.
                        </small>
                        <Select
                            value={OASISAlertForm?.infos?.[0]?.severity_id}
                            id="certainty"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Status"
                            loading={severitiesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    infos: prev.infos
                                        ? [
                                            {
                                                ...prev.infos[0],
                                                severity_id: value,
                                            },
                                            ...prev.infos.slice(1),
                                        ]
                                        : [],
                                }))
                            }
                        >
                            {severities?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="certainty">Certainty *</label>
                        <small>
                            Indicates the confidence level in the occurrence or likelihood of
                            the subject event. This is a <strong>required</strong> element in
                            the <code>&lt;info&gt;</code> block. It helps assess how likely
                            the described event is to happen. Allowed values are:
                            <code>Observed</code> – Determined to have occurred or to be
                            ongoing.
                            <code>Likely</code> – Probability greater than approximately 50%.
                            <code>Possible</code> – Probability less than or equal to 50%.
                            <code>Unlikely</code> – Not expected to occur (probability near
                            0%).
                            <code>Unknown</code> – Certainty is not known.
                        </small>
                        <Select
                            value={OASISAlertForm?.infos?.[0]?.certainty_id}
                            id="certainty"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Status"
                            loading={certaintiesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    infos: prev.infos
                                        ? [
                                            {
                                                ...prev.infos[0],
                                                certainty_id: value,
                                            },
                                            ...prev.infos.slice(1),
                                        ]
                                        : [],
                                }))
                            }
                        >
                            {certainties?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.code}</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="audience">Audience</label>
                        <small>
                            Human-readable description of who the alert is intended for. Helps
                            clarify the <code>scope</code> of the alert. Optional field.
                        </small>
                        <select
                            id="audienceDropdown"
                            onchange="document.getElementById('audience').value=this.value"
                        >
                            <option value="">-- Select Intended Audience --</option>
                            <option value="General Public">General Public</option>
                            <option value="Emergency Responders">Emergency Responders</option>
                            <option value="Government Agencies">Government Agencies</option>
                            <option value="Private Organizations">
                                Private Organizations
                            </option>
                            <option value="Media Outlets">Media Outlets</option>
                            <option value="Military Personnel">Military Personnel</option>
                            <option value="Educational Institutions">
                                Educational Institutions
                            </option>
                            <option value="Healthcare Facilities">
                                Healthcare Facilities
                            </option>
                            <option value="Residents of Affected Area">
                                Residents of Affected Area
                            </option>
                        </select>
                        <Input className="h-[2.625rem]"
                            type="text"
                            id="audience"
                            name="audience"
                            placeholder="Enter a custom audience here"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="eventCode">Event Code</label>
                        <small>
                            Event codes are structured identifiers aligned with local agencies
                            (PAGASA, PHIVOLCS, NDRRMC).Used for system interoperability and
                            automated parsing. Optional per CAP v1.2.
                        </small>
                        <Select
                            value={OASISAlertForm?.infos?.[0]?.event_code}
                            id="evenCode"
                            className="w-full h-[2.625rem]"
                            placeholder="Select Event Code"
                            loading={eventCodesLoading}
                            showSearch
                            allowClear
                            optionLabelProp="label"
                            onChange={value =>
                                setOASISAlertForm(prev => ({
                                    ...prev,
                                    infos: prev.infos
                                        ? [
                                            {
                                                ...prev.infos[0],
                                                event_code: value,
                                            },
                                            ...prev.infos.slice(1),
                                        ]
                                        : [],
                                }))
                            }
                        >
                            {eventCodes?.results?.map((item, index) => (
                                <Option
                                    key={index}
                                    value={item?.id}
                                    label={item?.description}
                                >
                                    <div className="flex flex-col">
                                        <span>{item?.value_name} ({item?.value})</span>
                                        <span className="text-xs text-gray-500">{item?.description}</span>
                                    </div>
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="effective">Effective</label>
                        <small>
                            The effective time of the information of the alert message. This
                            element indicates the exact date and time when the alert
                            information becomes operationally valid. It is optional in CAP
                            v1.2. If not specified, the <code>&lt;sent&gt;</code> time should
                            be considered the effective time. Format must follow ISO 8601
                            (e.g., <code>2025-05-28T11:11:00+08:00</code>).
                        </small>
                        <Input className="h-[2.625rem]" id="effective" type="datetime-local" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="onset">Onset</label>
                        <small>
                            The expected time of the beginning of the subject event of the
                            alert message. This element describes when the hazard is
                            anticipated to start affecting the target area. It is optional in
                            CAP v1.2. Format must follow ISO 8601 (e.g.,{" "}
                            <code>2025-05-28T11:11:00+08:00</code>).
                        </small>
                        <Input className="h-[2.625rem]" id="onset" type="datetime-local" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="expires">Expires</label>
                        <small>
                            The expiry time of the information of the alert message. This
                            element defines the date and time beyond which the information in
                            the alert should no longer be considered valid or actionable. It
                            is optional in CAP v1.2, but strongly recommended. Format must
                            follow ISO 8601 (e.g., <code>2025-05-28T13:30:00+08:00</code>).
                        </small>
                        <Input className="h-[2.625rem]" id="expires" type="datetime-local" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="senderName">Sender Name</label>
                        <small>
                            The human-readable name of the agency or authority issuing the
                            alert. This element provides a descriptive identity for the sender
                            to aid recognition and trust by recipients. It is optional in CAP
                            v1.2, but recommended for clarity. Examples:{" "}
                            <code>
                                National Disaster Risk Reduction and Management Council
                            </code>
                            ,{" "}
                            <code>
                                Philippine Atmospheric, Geophysical and Astronomical Services
                                Administration (PAGASA)
                            </code>
                        </small>
                        <Input className="h-[2.625rem]"
                            id="senderName"
                            value="Bureau of Jail Management and Penology"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="headline">Headline</label>
                        <small>
                            A brief human-readable title for the alert message. It is intended
                            to be used as a quick summary or headline for display in alerting
                            systems, mobile notifications, or news tickers. This element is
                            optional in CAP v1.2, but highly recommended to quickly convey the
                            essence of the alert. Example:{" "}
                            <code>Flash Flood Warning in Metro Manila</code>
                        </small>
                        <Input className="h-[2.625rem]" id="headline" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <small>
                            An extended human-readable description of the hazard or event.
                            This element provides detailed information about the alert,
                            including what is happening, where, and what the potential impacts
                            are. It is optional in CAP v1.2, but strongly recommended for
                            clarity and context. This may include background information,
                            affected areas, potential consequences, and public instructions.
                            Example:{" "}
                            <code>
                                Heavy rainfall is expected to cause flash floods in low-lying
                                areas of Metro Manila from 4 PM to 10 PM.
                            </code>
                        </small>
                        <textarea id="description"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="instruction">Instruction</label>
                        <small>
                            Human-readable recommended action to be taken by recipients of the
                            alert. This is often provided to guide the public or responders on
                            how to protect life and property (Optional).
                        </small>
                        <select
                            id="instructionDropDown"
                            onchange="document.getElementById('instruction').value=this.value"
                        >
                            <option value="">-- Select Instruction --</option>
                            <optgroup label="🚨 General Emergency">
                                <option>Shelter in place</option>
                                <option>Evacuate immediately</option>
                                <option>Follow local authority instructions</option>
                                <option>Remain indoors</option>
                                <option>Stay tuned to media updates</option>
                            </optgroup>
                            <optgroup label="🌪️ Weather and Natural Disasters">
                                <option>Move to higher ground</option>
                                <option>Avoid low-lying areas</option>
                                <option>Close windows and doors</option>
                                <option>Seek sturdy shelter</option>
                                <option>Do not attempt to cross flooded roads</option>
                            </optgroup>
                            <optgroup label="🔥 Fire and Hazard">
                                <option>Shut off gas and electricity</option>
                                <option>Do not use elevators</option>
                                <option>Use stairs for evacuation</option>
                                <option>Wear protective masks</option>
                                <option>Leave the area immediately</option>
                            </optgroup>
                            <optgroup label="☣️ Health and Contamination">
                                <option>Wear an N95 mask</option>
                                <option>Wash hands frequently</option>
                                <option>Avoid contact with others</option>
                                <option>Seek medical attention if symptoms appear</option>
                                <option>Do not consume local water supply</option>
                            </optgroup>
                            <optgroup label="🚓 Security or Civil Disturbance">
                                <option>Avoid affected areas</option>
                                <option>Report suspicious activity</option>
                                <option>Do not approach armed individuals</option>
                                <option>Follow curfew orders</option>
                                <option>Limit travel</option>
                            </optgroup>
                        </select>

                        <Input className="h-[2.625rem]"
                            type="text"
                            id="instruction"
                            name="instruction"
                            placeholder="Enter a custom description here"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="web">Web</label>
                        <small>
                            The URI (Uniform Resource Identifier) of a web page with
                            additional or related information. This element allows recipients
                            to access more detailed content, official bulletins, or updates
                            about the alert. It is optional in CAP v1.2. The value must be a
                            valid absolute URL (e.g., <code>https://www.ndrrmc.gov.ph</code>).
                        </small>
                        <Input className="h-[2.625rem]" id="web" type="url" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="contact">Contact</label>
                        <small>
                            The contact information for follow-up and confirmation of the
                            alert. This may include the name, telephone number, email address,
                            or other communication channels of the issuing authority or
                            responsible agency. It is optional in CAP v1.2, but useful for
                            verification and coordination. Example:{" "}
                            <code>
                                Operations Center, NDRRMC – +63-2-8911-5061 loc 100,
                                ops@ndrrmc.gov.ph
                            </code>
                        </small>
                        <Input className="h-[2.625rem]" id="contact" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="parameter">Parameter</label>
                        <small>
                            A system-specific additional parameter associated with the alert
                            message. Each <code>&lt;parameter&gt;</code> consists of a
                            name-value pair, allowing systems to include extra data not
                            explicitly covered by standard CAP elements. This is useful for
                            custom integrations, sensor readings, thresholds, or internal
                            identifiers. It is optional in CAP v1.2. Example format:{" "}
                            <code>eventCode:12345</code> or <code>hazardLevel:Red</code>
                        </small>

                        <select
                            id="parameterDropdown"
                            onchange="document.getElementById('parameter').value=this.value"
                        >
                            <option value="">-- Select Parameter --</option>
                            <option value="alertLevel=Red">alertLevel = Red</option>
                            <option value="alertLevel=Orange">alertLevel = Orange</option>
                            <option value="alertLevel=Yellow">alertLevel = Yellow</option>

                            <option value="hazardCode=EQ">
                                hazardCode = EQ (Earthquake)
                            </option>
                            <option value="hazardCode=TC">
                                hazardCode = TC (Tropical Cyclone)
                            </option>
                            <option value="hazardCode=FL">hazardCode = FL (Flood)</option>

                            <option value="severityIndex=5">severityIndex = 5</option>
                            <option value="urgencyMinutes=15">urgencyMinutes = 15</option>

                            <option value="ndrrmcFlag=true">ndrrmcFlag = true</option>
                            <option value="issuedBy=PHIVOLCS">issuedBy = PHIVOLCS</option>
                            <option value="issuedBy=PAGASA">issuedBy = PAGASA</option>

                            <option value="drillCode=EVAC2024">drillCode = EVAC2024</option>
                        </select>
                        <Input className="h-[2.625rem]"
                            type="text"
                            id="parameter"
                            name="parameter"
                            placeholder="Enter a custom parameter here"
                        />
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Area Block</legend>
                    <small>
                        The <strong>Area block</strong> describes the geographic area to
                        which the alert applies. It may contain one or more{" "}
                        <code>&lt;area&gt;</code> elements, each of which can include a
                        human-readable area description, geospatial shapes (polygon or
                        circle), geocodes, altitude, and ceiling values. This section
                        supports both visual display and automated geotargeting of alerts.
                        At least one <code>&lt;areaDesc&gt;</code> is{" "}
                        <strong>required</strong> for each <code>&lt;area&gt;</code> block.
                        Additional geospatial elements are optional and intended to enhance
                        precision and interoperability.
                    </small>
                    <div className="form-group">
                        <label htmlFor="areaDesc">Area Description *</label>
                        <small>
                            A human-readable description of the geographic area to which the
                            alert applies. This element is <strong>required</strong> for each{" "}
                            <code>&lt;area&gt;</code> block and serves as a plain-language
                            summary of the affected location(s). It should be concise and
                            clear enough for recipients to understand where the alert is
                            relevant, even if they cannot interpret geospatial data. Examples:{" "}
                            <code>Metro Manila</code>, <code>Eastern Visayas</code>,{" "}
                            <code>Barangay 45, Tacloban City</code>
                        </small>
                        <textarea id="areaDesc" required></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="polygon">Polygon</label>
                        <small>
                            A set of points describing a polygon that outlines the affected
                            area on the earth’s surface. Each point is represented as a pair
                            of latitude and longitude values separated by a comma, and points
                            are separated by a space. The first and last points should be the
                            same to close the polygon. This element is optional in CAP v1.2
                            but useful for precise geotargeting. Example:{" "}
                            <code>
                                14.5995,120.9842 14.6000,120.9850 14.5980,120.9850
                                14.5995,120.9842
                            </code>
                        </small>
                        <textarea id="polygon"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="circle">Circle</label>
                        <small>
                            A circular area defined by a center point and radius in
                            kilometers. The value consists of a single latitude/longitude pair
                            followed by the radius, separated by a space. This element is
                            optional in CAP v1.2 and provides a simple method for defining a
                            radial alert zone. Example: <code>14.5995,120.9842 10</code>
                            (This defines a circle centered at 14.5995°N, 120.9842°E with a
                            10-km radius.)
                        </small>
                        <textarea id="circle"></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="geocode">Geocode</label>
                        <small>
                            A system-specific geographic code or identifier for the affected
                            area. The <code>&lt;geocode&gt;</code> element is a container for
                            a pair of values: a name (key) and a corresponding value,
                            representing standard or agency-specific location codes. It is
                            optional in CAP v1.2 but useful for automated systems such as GIS,
                            broadcast targeting, or decision-support tools. Example:{" "}
                            <code>UGC: PHZ001</code> or <code>P-CODE: PH010100000</code>
                        </small>
                        <select
                            id="geocodeDropdown"
                            onchange="document.getElementById('geocode').value=this.value"
                        >
                            <option value="">-- Select Geocode --</option>
                            <optgroup label="UGC (Universal Geographic Code)">
                                <option>UGC: PHZ001</option>
                                <option>UGC: PHZ002</option>
                            </optgroup>
                            <optgroup label="P-CODE (Humanitarian)">
                                <option>P-CODE: PH010100000</option>
                                <option>P-CODE: PH020200000</option>
                            </optgroup>
                            <optgroup label="PSGC (Philippine Statistical Code)">
                                <option>PSGC: 012800000</option>
                                <option>PSGC: 035401000</option>
                            </optgroup>
                            <optgroup label="Barangay Code">
                                <option>Barangay: 137602001</option>
                                <option>Barangay: 137602002</option>
                            </optgroup>
                            <optgroup label="ISO 3166-2:PH">
                                <option>ISO: PH-NCR</option>
                                <option>ISO: PH-05</option>
                            </optgroup>
                        </select>
                        <Input className="h-[2.625rem]"
                            type="text"
                            id="geocode"
                            name="geocode"
                            placeholder="Enter a custom geo code here"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="altitude">Altitude</label>
                        <small>
                            The specific minimum altitude of the affected area, measured in
                            meters above sea level. This element is optional in CAP v1.2 and
                            is useful for alerts involving aviation, mountainous terrain, or
                            vertical hazard zones. If used, it should be accompanied by a
                            corresponding <code>&lt;ceiling&gt;</code> value to define a
                            vertical range. Example: <code>100</code> (indicates the area is
                            affected starting at 100 meters elevation)
                        </small>
                        <Input className="h-[2.625rem]" id="altitude" />
                    </div>

                    <div className="form-group">
                        <label htmlFor="ceiling">Ceiling</label>
                        <small>
                            The specific maximum altitude of the affected area, measured in
                            meters above sea level. This element is optional in CAP v1.2 and
                            is typically used in conjunction with{" "}
                            <code>&lt;altitude&gt;</code> to define a vertical range of the
                            alert zone. It is especially relevant for aviation, airborne
                            hazards, or mountainous areas. Example: <code>2000</code>{" "}
                            (indicates the alert applies up to 2000 meters elevation)
                        </small>
                        <Input className="h-[2.625rem]" id="ceiling" />
                    </div>
                </fieldset>

                <button type="submit">Generate CAP XML</button>
                <button id="downloadXml" style={{ display: "none", marginTop: "10px" }}>
                    Download XML
                </button>
            </form>
            <h2>Generated XML Output</h2>
            <pre id="xmlOutput" className="xml-output"></pre>
        </div>
    );
};

export default OasisAlertForm;
