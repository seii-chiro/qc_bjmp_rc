type FooterCardProps = {
    icon: string;
    iconStyle?: string;
    title: string;
    header: string;
}

const FooterCard = ({ header, icon, title, iconStyle }: FooterCardProps) => {
    return (
        <div className="h-14 flex gap-1 pr-8 items-center justify-center border shadow-[#1e7cbf]/25 border-[#1E7CBF]/25 shadow-md rounded-lg py-2 px-2 my-1 z-[1000]">
            <div>
                <img src={icon} alt={title} className={iconStyle} />
            </div>
            <div>
                <h3 className="text-[#1E365D] mb-0 leading-[1]">{header}</h3>
                <h2 className="text-[#1E365D] font-bold mt-0 leading-tight">{title}</h2>
            </div>
        </div>
    )
}

export default FooterCard