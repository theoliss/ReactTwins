const canvas = document.getElementById("WorkSpace");

let Objects_on_scene = {};
const Id_To_Pieces = {0 : "W_Pawn", 1 : "W_Bishop", 2 : "W_Knight", 3 : "W_Rook", 4 : "W_Queen", 5 : "W_King", 108 : "B_Pawn", 109 : "B_Bishop", 110 : "B_Knight", 111 : "B_Rook", 112 : "B_Queen", 113 : "B_King"};

let Calibration_Mode = false;
let Calibration_Save;
let canvasX = 0;
let canvasY = 0;
let canvasStrechX = 0;
let canvasStrechY = 0;

let saved_Calibration_datas = localStorage.getItem("saved_Calibration_datas");
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
        socket.emit('config', {server:{port: 3333,host: '127.0.0.1'},client: {port: 3334,host: '127.0.0.1'}});
    });
    socket.on('message', Decript_OSC_Message);
}

function Decript_OSC_Message(oscBundle){
    _l = oscBundle.packets.length;
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
                        Objects_on_scene[Instance_ID] = {0 : 0,1 : 0.0,2 : 0.0, 3 : 0.0,4 : 1};
                    }
                }

                //remove all cursors that where removed : 
                for(let k = 0; k < old_list_of_alive_objects.length; k++)
                {
                    let session_to_remove = old_list_of_alive_objects[k];

                    if (new_list_of_alive_objects.indexOf(session_to_remove) == -1 && Objects_on_scene[session_to_remove][4] == 1)
                    {
                        Objects_on_scene[session_to_remove][4] = 0;
                    }
                    else if(Objects_on_scene[session_to_remove][4] == 0)
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
                    Objects_on_scene[Instance][0] = ID;
                    Objects_on_scene[Instance][1] = normalised_X;
                    Objects_on_scene[Instance][2] = normalised_Y;
                    Objects_on_scene[Instance][3] = Angle;
                }

            }
        }
    }
}

function drawCircle(ctx, x, y, radius = 50) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = "red";
    ctx.fill();
  }

chess_pieces_source_image = document.getElementById("chess_pieces_sprites");
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
        case "W_Pawn" : sx = 741; sy = 50; sWidth = 77; sHeight = 101; break;
        
        case "B_King" : sx = 21; sy = 41+141; sWidth = 109; sHeight = 112; break;
        case "B_Queen" : sx = 157; sy = 41+141; sWidth = 121; sHeight = 112; break;
        case "B_Bishop" : sx = 301; sy = 41+141; sWidth = 110; sHeight = 109; break;
        case "B_Knight" : sx = 445; sy = 46+141; sWidth = 107; sHeight = 105; break;
        case "B_Rook" : sx = 596; sy = 52+141; sWidth = 91; sHeight = 100; break;
        case "B_Pawn" : sx = 741; sy = 50+141; sWidth = 77; sHeight = 101; break;

        default : drawCircle(ctx,x,y); return;
    }
    ctx.drawImage(chess_pieces_source_image, sx, sy, sWidth, sHeight, x-sWidth/2, y-sHeight/2, 0.8*length, 0.8*length);
}

function Render_table(){
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
        Draw_Chess_Piece(ctx, Id_To_Pieces[current_object[0]],canvas.width * current_object[1],canvas.height * current_object[2], square_lenght);
    }
    setTimeout(Render_table, 1/30 * 1000);
}

window.addEventListener("resize", () => {
    Update_Canva_Size();
});

// Handle keyboard input
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
            canvas.style.border = "1px solid white";
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
            case "q": canvasStrechX -= 10; canvasX += 5; break;
            case "s": canvasStrechY -= 10; canvasY += 5; break;
            case "d": canvasStrechX += 10; canvasX -= 5; break;
            case "r": canvasX = 0; canvasY = 0; canvasStrechX = 0; canvasStrechY = 0; break;
        }
        Update_Canva_Size();
    }

});

//Init
WSConnection("http://127.0.0.1:3000");//or port 5000
Render_table();
