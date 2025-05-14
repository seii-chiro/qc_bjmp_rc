import { Image, Input, Select } from "antd"
import { MapContainer } from "react-leaflet"

const Report = () => {
    return (
        <div className="mt-2">
            <div className="w-full h-[90vh] flex gap-5 rounded shadow-allSide ">
                <div className="flex-1">
                    <Input.TextArea />
                    <Select />
                    <div>
                        <span>Upload Image</span>
                        <input type="file" />
                    </div>
                    <div>
                        <Image />
                    </div>
                    <button>Report</button>
                </div>
                <div className="flex-1">
                    <Input />
                    <div className="w-full flex gap-10">
                        <span className="flex gap-2">
                            <input type="checkbox" />
                            <span>Use Current Location</span>
                        </span>
                        <span className="flex gap-2">
                            <input type="checkbox" />
                            <span>Use Current Location</span>
                        </span>
                    </div>
                    <div>
                        <p>Incident Address</p>
                        <div>
                            <MapContainer />
                        </div>
                    </div>
                    <div>
                        <p>Report Address</p>
                        <Input />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Report