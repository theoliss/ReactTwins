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
        case "B_King" : sx = 21; sy = 41; sWidth = 109; sHeight = 112; break;
        case "B_Queen" : sx = 157; sy = 41; sWidth = 121; sHeight = 112; break;
        case "B_Bishop" : sx = 301; sy = 41; sWidth = 110; sHeight = 109; break;
        case "B_Knight" : sx = 445; sy = 46; sWidth = 107; sHeight = 105; break;
        case "B_Rook" : sx = 596; sy = 52; sWidth = 91; sHeight = 100; break;
        case "B_Pawn" : sx = 741; sy = 50; sWidth = 79; sHeight = 101; break;
        
        case "W_King" : sx = 21; sy = 41+141; sWidth = 109; sHeight = 112; break;
        case "W_Queen" : sx = 157; sy = 41+141; sWidth = 121; sHeight = 112; break;
        case "W_Bishop" : sx = 301; sy = 41+141; sWidth = 110; sHeight = 109; break;
        case "W_Knight" : sx = 445; sy = 46+141; sWidth = 107; sHeight = 105; break;
        case "W_Rook" : sx = 596; sy = 52+141; sWidth = 91; sHeight = 100; break;
        case "W_Pawn" : sx = 741; sy = 50+141; sWidth = 79; sHeight = 101; break;

        default : drawCircle(ctx,x,y); return;
    }
    //ctx.drawImage(chess_pieces_source_image, sx, sy, sWidth, sHeight, (Math.floor(x/length) * length)-length/2, (Math.floor(y/length) * length), 0.8*length*sWidth/Math.max(sWidth,sHeight), 0.8*length*sHeight/Math.max(sWidth,sHeight));
    ctx.drawImage(chess_pieces_source_image, sx, sy, sWidth, sHeight, x-sWidth/2, y-sHeight/2, 0.8*length*sWidth/Math.max(sWidth,sHeight), 0.8*length*sHeight/Math.max(sWidth,sHeight));
}

export function Render_Chess(canvas,Objects_on_scene){
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
