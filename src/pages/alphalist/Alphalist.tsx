import { GodotLink, Header } from "../assets/components/link";

const Alphalist = () => {
    return (
        <div className="border border-gray-200 p-5 w-full md:max-w-md shadow-sm hover:shadow-md rounded-md">
            <Header title="Alpha List" />
            <div className="mt-2 ml-8">
                <GodotLink link="/jvms/personnels/personnel" title="Personnel" />
                <GodotLink link="/jvms/visitors/visitor" title="Visitor" />
                <GodotLink link="/jvms/pdls/pdl" title="PDL" />
                <GodotLink link="/jvms/service-provider" title="Service Provider" />
                <GodotLink link="/jvms/non-pdl-visitors" title="Non-PDL Visitor" />
            </div>
        </div>
    );
};

export default Alphalist;