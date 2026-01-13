export default function Request(props) {
    
    if (props.rec) {
        return <div id ="requestContainer">
        <div id="reqName">
            { props.firstName }
        </div>
        <div id="accDel">
            <button id="accFri" onClick={ props.acc }>O</button>
            <button id="delFri" onClick={ props.del }>X</button>
        </div>
    </div>
    }
    return <div id ="requestContainer">
        <div id="reqName">
            { props.firstName }
        </div>
        <button id="delFri" onClick={ props.del }>X</button>
    </div>
}