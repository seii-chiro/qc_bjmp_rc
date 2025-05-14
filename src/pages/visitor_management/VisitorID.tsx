import { getVisitors } from '@/lib/queries'
import { useTokenStore } from '@/store/useTokenStore'
import { useQuery } from '@tanstack/react-query'
import { Select } from 'antd'

const VisitorID = () => {
    const token = useTokenStore()?.token

    const { data: visitors, isLoading: visitorsLoading } = useQuery({
        queryKey: ['visitors', 'visitorID'],
        queryFn: () => getVisitors(token ?? ""),
    })

    return (
        <div>
            <div className='w-full h-full flex flex-col gap-5'>
                <div>
                    <Select
                        loading={visitorsLoading}
                        showSearch
                        optionFilterProp='label'
                        placeholder='Select Visitor'
                        className='w-72'
                        options={visitors?.map((visitor) => ({
                            value: visitor.id,
                            label: `${visitor?.person?.first_name ?? ""} ${visitor?.person?.middle_name ?? ""} ${visitor?.person?.last_name ?? ""}`,
                        })) ?? []}
                    />
                </div>

                <div className='w-full flex flex-col lg:flex-row lg:gap-12'>
                    <div className='flex-1 bg-gray-100 '>
                        <div className='w-full border-4 border-black h-[30rem] flex flex-col bg-gray-200 relative'>
                            <div className='flex'>
                                <div className='custom-shape1 bg-gray-600 absolute w-[45%] h-10 right-0 z-10'>
                                    <p className='text-center text-white text-xl py-1.5 font-semibold'>VISITOR ID CARD</p>
                                </div>
                                <div className='custom-shape1 bg-black absolute w-[50%] h-12 right-0 top-[5%]'></div>
                                <div className='custom-shape2 bg-gray-600 absolute w-[55%] h-20 top-[8.5%] z-[2]'></div>
                                <div className='custom-shape4 bg-black absolute w-[50%] pl-0 py-5 pr-8 h-16 top-[12.5%] z-10 flex items-center justify-center'>
                                    <p className='text-center text-white text-xl font-semibold'>QUEZON CITY JAIL MALE DORM</p>
                                </div>
                                <div className='custom-shape3 bg-gray-400 absolute w-full h-8 top-[21%] flex items-center justify-end pr-[15%]'>
                                    <p className='text-white text-right font-semibold'>Regular Visitor</p>
                                </div>
                            </div>
                            <div className='flex absolute top-[25%] left-0 w-full h-full p-5 gap-5'>
                                <div className='flex-1 border-4 border-black h-[75%]'>

                                </div>
                                <div className='flex-1 border-4 border-black h-[75%]'>

                                </div>
                            </div>
                        </div>
                    </div>
                    <div className='flex-1 bg-gray-100 '>
                        <div className='w-full border-4 border-black h-[30rem] flex flex-col bg-gray-200 relative'>
                            <div className='flex'>
                                <div className='custom-shape1 bg-gray-600 absolute w-[45%] h-10 right-0 z-10'>
                                    <p className='text-center text-white text-xl py-1.5 font-semibold'>VISITOR ID CARD</p>
                                </div>
                                <div className='custom-shape1 bg-black absolute w-[50%] h-12 right-0 top-[5%]'></div>
                                <div className='custom-shape2 bg-gray-600 absolute w-[55%] h-20 top-[8.5%] z-[2]'></div>
                                <div className='custom-shape4 bg-black absolute w-[50%] pl-0 py-5 pr-8 h-16 top-[12.5%] z-10 flex items-center justify-center'>
                                    <p className='text-center text-white text-xl font-semibold'>QUEZON CITY JAIL MALE DORM</p>
                                </div>
                                <div className='custom-shape3 bg-gray-400 absolute w-full h-8 top-[21%] flex items-center justify-end pr-[15%]'>
                                    <p className='text-white text-right font-semibold'>Regular Visitor</p>
                                </div>
                            </div>
                            <div className='flex absolute top-[25%] left-0 w-full h-full p-5 gap-5'>
                                <div className='flex-1 border-4 border-black h-[75%]'>

                                </div>
                                <div className='flex-1 border-4 border-black h-[75%]'>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default VisitorID