export default function AlertMessage(props) {
    const type = props.type || "success";
    const bgColor = type === "error" ? "bg-red-100 border-red-400 text-red-700" : "bg-green-100 border-green-400 text-green-700";
    
    return (
        <div class={`p-4 mb-4 rounded border ${bgColor}`}>
            {props.message}
        </div>
    );
}
