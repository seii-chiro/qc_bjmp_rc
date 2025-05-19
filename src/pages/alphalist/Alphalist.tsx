import { GoLink } from "../assets/components/link";

const Alphalist = () => {
    return (
        <div className="p-5">
            <h1 className="text-3xl font-bold text-[#1E365D] mb-5">Alpha List</h1>
            <div className="flex flex-col gap-5">
                <GoLink link="/jvms/personnels/personnel" title="Personnel" />
                <GoLink link="/jvms/visitors/visitor" title="Visitor" />
                <GoLink link="/jvms/pdls/pdl" title="PDL" />
                <GoLink link="/jvms/service-provider" title="Service Provider" />
            </div>
        </div>
    );
};

export default Alphalist;