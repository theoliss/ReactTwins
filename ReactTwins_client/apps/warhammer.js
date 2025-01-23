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

    let HardWare_Width = 760;
    let HardWare_Heigh = 360;

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
export function Render_WarHammer(canvas,Objects_on_scene){
    let ctx = canvas.getContext('2d');
    ctx.drawImage(forest_texture, 0, 0, canvas.width, canvas.height);

    for(let m = 0; m < Object.keys(Objects_on_scene).length; m++)
    {
        let current_object = Objects_on_scene[Object.keys(Objects_on_scene)[m]];
        Draw_Chess_Piece(ctx, Id_To_Pieces[current_object["ID"]],canvas.width * current_object["normalised_X"],canvas.height * current_object["normalised_Y"], canvas);
    }
}
