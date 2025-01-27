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
                        Objects_on_scene[Instance_ID] = {"ID" : 0,"normalised_X" : 0.0,"normalised_Y" : 0.0, "angle" : 0.0,"Stay_During_Next_Frame" : 1};
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
                let angle = oscBundle.packets[i].args[5].value; 

                if(Object.keys(Objects_on_scene).indexOf(Instance) != -1){
                    Objects_on_scene[Instance]["ID"] = ID;
                    Objects_on_scene[Instance]["normalised_X"] = normalised_X;
                    Objects_on_scene[Instance]["normalised_Y"] = normalised_Y;
                    Objects_on_scene[Instance]["angle"] = angle;
                }

            }
        }
    }
}

//import { Render_Chess } from "./apps/chess.js";
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





/*
const Id_To_Pieces = {0 : "Terminator", 1 : "Terminator_With_Assault_Canon", 2 : "Redemptor_Dreadnought", 3 : "Hell_Blaster", 108 : "Necron_Warrior", 109 : "Skorpekh_Destroyer", 110 : "Lokhust_Heavy_Destroyer"};

function drawCircle(ctx, x, y, radius = 50) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }

const warhammer_pieces_source_image = document.getElementById("warhammer_pieces_sprites");
//const warhammer_pieces_source_image = document.getElementById("warhammer_pieces_sprites_debug");
function Draw_Chess_Piece(ctx,piece, x, y, canvas){

    let HardWare_Width = 718;
    let HardWare_Heigh = 365;

    let sx = 0;
    let sy = 0;
    let sWidth = 0;
    let sHeight = 0;
    let real_life_radius = 0;
    let image_radius = 0;

    switch(piece)
    {
        case "Terminator" : sx = 419; sy = 165; sWidth = 499; sHeight = 486; real_life_radius = 40; image_radius = 485; break;
        case "Terminator_With_Assault_Canon" : sx = 1087; sy = 164; sWidth = 779; sHeight = 509; real_life_radius = 40; image_radius = 485; break;
        case "Redemptor_Dreadnought" : sx = 1527; sy = 1067; sWidth = 1392; sHeight = 1195; real_life_radius = 90; image_radius = 1075; break;
        case "Hell_Blaster" : sx = 1002; sy = 869; sWidth = 460; sHeight = 454; real_life_radius = 32; image_radius = 391; break;
        
        case "Necron_Warrior" : sx = 213; sy = 719; sWidth = 612; sHeight = 652; real_life_radius = 32; image_radius = 391; break;
        case "Skorpekh_Destroyer" : sx = 481; sy = 1572; sWidth = 622; sHeight = 626; real_life_radius = 50; image_radius = 603; break;
        case "Lokhust_Heavy_Destroyer" : sx = 1874; sy = 3; sWidth = 721; sHeight = 928; real_life_radius = 60; image_radius = 721; break;

        default : drawCircle(ctx,x,y); return;
    }

    //ctx.drawImage(warhammer_pieces_source_image, sx, sy, sWidth, sHeight, (Math.floor(x/length) * length)-length/2, (Math.floor(y/length) * length), 0.8*length*sWidth/Math.max(sWidth,sHeight), 0.8*length*sHeight/Math.max(sWidth,sHeight));
    let projection_width = (sWidth*(real_life_radius*canvas.width/HardWare_Width))/image_radius;
    let projection_height = (sHeight*(real_life_radius*canvas.height/HardWare_Heigh))/image_radius;
    ctx.drawImage(warhammer_pieces_source_image, sx, sy, sWidth, sHeight, x-(canvas.width*real_life_radius/HardWare_Width)/2, y-(canvas.height*real_life_radius/HardWare_Heigh)/2, projection_width, projection_height);
}

const forest_texture = document.getElementById("forest_texture");   
function Render_WarHammer(canvas,Objects_on_scene){
    let ctx = canvas.getContext('2d');
    ctx.drawImage(forest_texture, 0, 0, canvas.width, canvas.height);

    for(let m = 0; m < Object.keys(Objects_on_scene).length; m++)
    {
        let current_object = Objects_on_scene[Object.keys(Objects_on_scene)[m]];
        Draw_Chess_Piece(ctx, Id_To_Pieces[current_object["ID"]],canvas.width * current_object["normalised_X"],canvas.height * current_object["normalised_Y"], canvas);
    }
}
*/





const Id_To_Pieces = {0 : "W_Pawn", 1 : "W_Bishop", 2 : "W_Knight", 3 : "W_Rook", 4 : "W_Queen", 5 : "W_King", 108 : "B_Pawn", 109 : "B_Bishop", 110 : "B_Knight", 111 : "B_Rook", 112 : "B_Queen", 113 : "B_King"};

function drawCircle(ctx, x, y, radius = 50) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }

const chess_pieces_source_image = document.getElementById("chess_pieces_sprites");
function Draw_Chess_Piece(ctx,piece, x, y, length){
    
    let sx = 0;
    let sy = 0;
    let sWidth = 0;
    let sHeight = 0;

    switch(piece)
    {
        case "W_King" : sx = 21; sy = 41; sWidth = 109; sHeight = 112; break;
        case "W_Queen" : sx = 157; sy = 41; sWidth = 121; sHeight = 112; break;
        case "W_Bishop" : sx = 301; sy = 41; sWidth = 110; sHeight = 109; break;
        case "W_Knight" : sx = 445; sy = 46; sWidth = 107; sHeight = 105; break;
        case "W_Rook" : sx = 596; sy = 52; sWidth = 91; sHeight = 100; break;
        case "W_Pawn" : sx = 741; sy = 50; sWidth = 79; sHeight = 101; break;
        
        case "B_King" : sx = 21; sy = 41+141; sWidth = 109; sHeight = 112; break;
        case "B_Queen" : sx = 157; sy = 41+141; sWidth = 121; sHeight = 112; break;
        case "B_Bishop" : sx = 301; sy = 41+141; sWidth = 110; sHeight = 109; break;
        case "B_Knight" : sx = 445; sy = 46+141; sWidth = 107; sHeight = 105; break;
        case "B_Rook" : sx = 596; sy = 52+141; sWidth = 91; sHeight = 100; break;
        case "B_Pawn" : sx = 741; sy = 50+141; sWidth = 79; sHeight = 101; break;

        default : drawCircle(ctx,x,y); return;
    }
    //ctx.drawImage(chess_pieces_source_image, sx, sy, sWidth, sHeight, (Math.floor(x/length) * length)-length/2, (Math.floor(y/length) * length), 0.8*length*sWidth/Math.max(sWidth,sHeight), 0.8*length*sHeight/Math.max(sWidth,sHeight));
    ctx.drawImage(chess_pieces_source_image, sx, sy, sWidth, sHeight, x-sWidth/2, y-sHeight/2, 0.8*length*sWidth/Math.max(sWidth,sHeight), 0.8*length*sHeight/Math.max(sWidth,sHeight));
}

function Render_Chess(canvas,Objects_on_scene){
    let ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    let square_lenght = Math.min(canvas.height,canvas.width)/8;
    for(let i =0; i<8;i++)
    {
        for(let j=0; j<8;j++)
        {
            if((j+i)%2 == 0){ctx.fillStyle = "lightblue"} else {ctx.fillStyle = "white"};
            ctx.fillRect(canvas.width/2+(i-4)*square_lenght,(j)*square_lenght,square_lenght,square_lenght);
        }
    }

    for(let m = 0; m < Object.keys(Objects_on_scene).length; m++)
    {
        let current_object = Objects_on_scene[Object.keys(Objects_on_scene)[m]];
        Draw_Chess_Piece(ctx, Id_To_Pieces[current_object["ID"]],canvas.width * current_object["normalised_X"],canvas.height * current_object["normalised_Y"], square_lenght);
    }

}







//Init
WSConnection("http://127.0.0.1:3000");//or port 5000
Render_table();
