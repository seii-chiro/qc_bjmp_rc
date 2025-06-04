import { AudienceDataSourceRecord } from "../Audience";

export type AudienceFormType = {
    code: string;
    description: string;
};

type Props = {
    recordToEdit: AudienceDataSourceRecord | null;
    handleClose: () => void;
};

const AudienceForm = ({ }: Props) => {
    return (
        <div>AudienceForm</div>
    )
}

export default AudienceForm