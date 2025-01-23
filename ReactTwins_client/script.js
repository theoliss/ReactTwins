const canvas = document.getElementById("WorkSpace");
let Objects_on_scene = {};

let Calibration_Mode = false;
let canvasX = 0;
let canvasY = 0;
let canvasStrechX = 0;
let canvasStrechY = 0;

let saved_Calibration_datas = localStorage.getItem("saved_Calibration_datas");
let datas;
if(saved_Calibration_datas !== null){
    datas = JSON.parse(saved_Calibration_datas);
    canvasX = datas["canvasX"];
    canvasY = datas["canvasY"];
    canvasStrechX = datas["canvasStrechX"];
    canvasStrechY = datas["canvasStrechY"]; 
}
Update_Canva_Size();

function Update_Canva_Size()
{
    canvas.style.top = `${canvasY}px`;
    canvas.style.left = `${canvasX}px`;
    canvas.width = window.innerWidth + canvasStrechX;
    canvas.height = window.innerHeight + canvasStrechY;
}


function WSConnection(_address){
    const socket = io(_address);
    socket.on('error', function(){
        console.log("Error connecting!");
    });
    socket.on('connect', function(){
        console.log("Server connected");
        socket.emit('config', {test : "test"});
    });
    socket.on('message', Decript_OSC_Message);
}

function Decript_OSC_Message(oscBundle){
    let _l = oscBundle.packets.length;
    for(var i=0;i<_l;i++)
    {
        if(oscBundle.packets[i].address == "/tuio/2Dobj")
        {   
            let instruction = oscBundle.packets[i].args[0].value;
            if(instruction == "alive")
            {
                let num_alive = oscBundle.packets[i].args.length - 1;
                let Instance_ID;
                let old_list_of_alive_objects = Object.keys(Objects_on_scene);
                let new_list_of_alive_objects = [];
                
                
                for(let j = 0; j < num_alive; j++)
                {
                    Instance_ID = oscBundle.packets[i].args[j+1].value; //pensez à checker si il faut bien mettre un %100 comme dans l'exemple
                    new_list_of_alive_objects.push(Instance_ID);
                    if(old_list_of_alive_objects.indexOf(Instance_ID) == -1)
                    {
                        Objects_on_scene[Instance_ID] = {"ID" : 0,"normalised_X" : 0.0,"normalised_Y" : 0.0, "Angle" : 0.0,"Stay_During_Next_Frame" : 1};
                    }
                }

                //remove all cursors that where removed : 
                for(let k = 0; k < old_list_of_alive_objects.length; k++)
                {
                    let session_to_remove = old_list_of_alive_objects[k];

                    if (new_list_of_alive_objects.indexOf(session_to_remove) == -1 && Objects_on_scene[session_to_remove]["Stay_During_Next_Frame"] == 1)
                    {
                        Objects_on_scene[session_to_remove]["Stay_During_Next_Frame"] = 0;
                    }
                    else if(Objects_on_scene[session_to_remove]["Stay_During_Next_Frame"] == 0)
                    {
                        delete Objects_on_scene[session_to_remove];
                    }
                }
            }
            else if (instruction == "set")
            {
                let Instance = String(oscBundle.packets[i].args[1].value); 
                let ID = oscBundle.packets[i].args[2].value;
                let normalised_X = oscBundle.packets[i].args[3].value;
                let normalised_Y = oscBundle.packets[i].args[4].value;
                let Angle = oscBundle.packets[i].args[5].value; 

                if(Object.keys(Objects_on_scene).indexOf(Instance) != -1){
                    Objects_on_scene[Instance]["ID"] = ID;
                    Objects_on_scene[Instance]["normalised_X"] = normalised_X;
                    Objects_on_scene[Instance]["normalised_Y"] = normalised_Y;
                    Objects_on_scene[Instance]["Angle"] = Angle;
                }

            }
        }
    }
}

import { Render_Chess } from "./apps/chess.js";
import { Render_WarHammer } from "./apps/warhammer.js";
function Render_table(){
    //Render_Chess(canvas, Objects_on_scene);
    Render_WarHammer(canvas,Objects_on_scene);
    setTimeout(Render_table, 1/30 * 1000);
}

window.addEventListener("resize", () => {
    Update_Canva_Size();
});

document.addEventListener("keydown", (e) => {

    if(e.key == "Enter")
    {
        Calibration_Mode = !(Calibration_Mode);
        if(Calibration_Mode)
        {
            canvas.style.border = "1px solid red";
        }
        else
        {
            canvas.style.border = "1px solid black";
            let to_save = { "canvasX": canvasX, "canvasY": canvasY , "canvasStrechX" : canvasStrechX, "canvasStrechY" : canvasStrechY};
            localStorage.setItem("saved_Calibration_datas", JSON.stringify(to_save));
        }
    }
    if(Calibration_Mode){
        switch (e.key) {
            case "ArrowUp": canvasY -= 10; break;
            case "ArrowDown": canvasY += 10; break;
            case "ArrowLeft": canvasX -= 10; break;
            case "ArrowRight": canvasX += 10; break;
            case "z": canvasStrechY += 10; canvasY -= 5; break;
            case "q": if(canvas.width + window.innerWidth + canvasStrechX > 10) {canvasStrechX -= 10; canvasX += 5;} break;
            case "s": if(canvas.height + window.innerHeight + canvasStrechY > 10) {canvasStrechY -= 10; canvasY += 5;} break;
            case "d": canvasStrechX += 10; canvasX -= 5; break;
            case "r": canvasX = 0; canvasY = 0; canvasStrechX = 0; canvasStrechY = 0; break;
        }
        Update_Canva_Size();
    }

});

//Init
WSConnection("http://127.0.0.1:3000");//or port 5000
Render_table();
