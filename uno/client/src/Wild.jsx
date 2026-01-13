export default function Wild(props) {
    if (props.show) {
        return <div id="chooseWild">
                    <div onClick={() => props.onClick("B")} className="wildChoice" id="chooseBlue"></div>
                    <div onClick={() => props.onClick("R")} className="wildChoice" id="chooseRed"></div>
                    <div onClick={() => props.onClick("Y")} className="wildChoice" id="chooseYellow"></div>
                    <div onClick={() => props.onClick("G")} className="wildChoice" id="chooseGreen"></div>
                </div>
    }
    else {
        return <></>
    }
}