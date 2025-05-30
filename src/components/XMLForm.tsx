import React from 'react';

type Props = {
    xml: string;
};

const XMLForm = ({ xml }: Props) => {
    const parseXMLToObject = (xmlString: string) => {
        try {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlString, "text/xml");

            const alert = xmlDoc.getElementsByTagName('alert')[0];
            const info = xmlDoc.getElementsByTagName('info')[0];
            const area = xmlDoc.getElementsByTagName('area')[0];

            return {
                // Alert level fields
                identifier: alert?.getElementsByTagName('identifier')[0]?.textContent || '',
                sender: alert?.getElementsByTagName('sender')[0]?.textContent || '',
                sent: alert?.getElementsByTagName('sent')[0]?.textContent || '',
                status: alert?.getElementsByTagName('status')[0]?.textContent || '',
                msgType: alert?.getElementsByTagName('msgType')[0]?.textContent || '',
                scope: alert?.getElementsByTagName('scope')[0]?.textContent || '',
                restriction: alert?.getElementsByTagName('restriction')[0]?.textContent || '',
                addresses: alert?.getElementsByTagName('addresses')[0]?.textContent || '',
                code: alert?.getElementsByTagName('code')[0]?.textContent || '',
                note: alert?.getElementsByTagName('note')[0]?.textContent || '',
                references: alert?.getElementsByTagName('references')[0]?.textContent || '',
                incidents: alert?.getElementsByTagName('incidents')[0]?.textContent || '',

                // Info level fields
                language: info?.getElementsByTagName('language')[0]?.textContent || '',
                category: info?.getElementsByTagName('category')[0]?.textContent || '',
                event: info?.getElementsByTagName('event')[0]?.textContent || '',
                responseType: info?.getElementsByTagName('responseType')[0]?.textContent || '',
                urgency: info?.getElementsByTagName('urgency')[0]?.textContent || '',
                severity: info?.getElementsByTagName('severity')[0]?.textContent || '',
                certainty: info?.getElementsByTagName('certainty')[0]?.textContent || '',
                audience: info?.getElementsByTagName('audience')[0]?.textContent || '',
                eventCode: info?.getElementsByTagName('eventCode')[0]?.textContent || '',
                effective: info?.getElementsByTagName('effective')[0]?.textContent || '',
                onset: info?.getElementsByTagName('onset')[0]?.textContent || '',
                expires: info?.getElementsByTagName('expires')[0]?.textContent || '',
                senderName: info?.getElementsByTagName('senderName')[0]?.textContent || '',
                headline: info?.getElementsByTagName('headline')[0]?.textContent || '',
                description: info?.getElementsByTagName('description')[0]?.textContent || '',
                instruction: info?.getElementsByTagName('instruction')[0]?.textContent || '',
                web: info?.getElementsByTagName('web')[0]?.textContent || '',
                contact: info?.getElementsByTagName('contact')[0]?.textContent || '',
                parameter: info?.getElementsByTagName('parameter')[0]?.textContent || '',

                // Area level fields
                areaDesc: area?.getElementsByTagName('areaDesc')[0]?.textContent || '',
                polygon: area?.getElementsByTagName('polygon')[0]?.textContent || '',
                circle: area?.getElementsByTagName('circle')[0]?.textContent || '',
                geocode: area?.getElementsByTagName('geocode')[0]?.textContent || '',
                altitude: area?.getElementsByTagName('altitude')[0]?.textContent || '',
                ceiling: area?.getElementsByTagName('ceiling')[0]?.textContent || '',
            };
        } catch (error) {
            console.error('Error parsing XML:', error);
            return null;
        }
    };

    const data = parseXMLToObject(xml);

    if (!data) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">Error parsing XML data</p>
            </div>
        );
    }

    const FormSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    );

    const FormField = ({ label, value, fullWidth = false }: { label: string; value: string; fullWidth?: boolean }) => (
        <div className={fullWidth ? "md:col-span-2" : ""}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-900">
                {value || 'N/A'}
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">OASIS Alert Details</h2>
                <p className="text-gray-600">Common Alerting Protocol (CAP) Message</p>
            </div>

            <FormSection title="Alert Information">
                <FormField label="Alert Identifier" value={data.identifier} />
                <FormField label="Sender" value={data.sender} />
                <FormField label="Sent Time" value={data.sent} />
                <FormField label="Status" value={data.status} />
                <FormField label="Message Type" value={data.msgType} />
                <FormField label="Scope" value={data.scope} />
                <FormField label="Restriction" value={data.restriction} fullWidth />
                <FormField label="Addresses" value={data.addresses} />
                <FormField label="Code" value={data.code} />
                <FormField label="Note" value={data.note} fullWidth />
                <FormField label="References" value={data.references} fullWidth />
                <FormField label="Incidents" value={data.incidents} fullWidth />
            </FormSection>

            <FormSection title="Event Information">
                <FormField label="Language" value={data.language} />
                <FormField label="Category" value={data.category} />
                <FormField label="Event Type" value={data.event} />
                <FormField label="Response Type" value={data.responseType} />
                <FormField label="Urgency" value={data.urgency} />
                <FormField label="Severity" value={data.severity} />
                <FormField label="Certainty" value={data.certainty} />
                <FormField label="Audience" value={data.audience} />
                <FormField label="Event Code" value={data.eventCode} />
                <FormField label="Effective Time" value={data.effective} />
                <FormField label="Onset Time" value={data.onset} />
                <FormField label="Expires Time" value={data.expires} />
                <FormField label="Sender Name" value={data.senderName} fullWidth />
                <FormField label="Headline" value={data.headline} fullWidth />
                <FormField label="Description" value={data.description} fullWidth />
                <FormField label="Instructions" value={data.instruction} fullWidth />
                <FormField label="Web URL" value={data.web} fullWidth />
                <FormField label="Contact Information" value={data.contact} fullWidth />
                <FormField label="Parameters" value={data.parameter} />
            </FormSection>

            <FormSection title="Geographic Area">
                <FormField label="Area Description" value={data.areaDesc} fullWidth />
                <FormField label="Polygon Coordinates" value={data.polygon} fullWidth />
                <FormField label="Circle Coordinates" value={data.circle} />
                <FormField label="Geocode" value={data.geocode} />
                <FormField label="Altitude (m)" value={data.altitude} />
                <FormField label="Ceiling (m)" value={data.ceiling} />
            </FormSection>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Alert Summary</h4>
                <p className="text-blue-700 text-sm">
                    <strong>{data.headline}</strong> - {data.severity} severity, {data.urgency} urgency
                    {data.effective && ` (Effective: ${new Date(data.effective).toLocaleString()})`}
                </p>
            </div>
        </div>
    );
};

export default XMLForm