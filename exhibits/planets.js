"use strict";

let sun_mass   = 100_000;
let planets    = [0, 1, 2].map(index => ({
    pos_x   : (0.5 + 0.3 * random(-1, 1)) * ctx.canvas.width,
    pos_y   : (0.5 + 0.3 * random(-1, 1)) * ctx.canvas.height,
    vel_x   : random(0, 250),
    vel_y   : random(0, 250),
    ang     : 0,
    ang_vel : 0,
    ang_acc : 0,
    grabbed : false,
    img     : (() => {
        let img = new Image();
        img.src = `./data/phucs/${index}.png`;
        return img;
    })(),
}))

let sun_x = ctx.canvas.width  / 2;
let sun_y = ctx.canvas.height / 2;

let background = new Image();
background.src = './data/background.jpg';

let katelyn = new Image();
katelyn.src = './data/katelyn.png';

const update = () =>
{
    ctx.drawImage(background, 0, 0, ctx.canvas.width, ctx.canvas.height);

    let sun_r = geolen(0.15);

    let sun_pos_offset_x = 0;
    let sun_pos_offset_y = 0;

    if (keys['ArrowLeft' ] || keys['KeyA']) sun_pos_offset_x -= 1;
    if (keys['ArrowRight'] || keys['KeyD']) sun_pos_offset_x += 1;
    if (keys['ArrowUp'   ] || keys['KeyW']) sun_pos_offset_y -= 1;
    if (keys['ArrowDown' ] || keys['KeyS']) sun_pos_offset_y += 1;

    let sun_pos_offset_r = Math.hypot(sun_pos_offset_x, sun_pos_offset_y);
    if (sun_pos_offset_r)
    {
        sun_pos_offset_x /= sun_pos_offset_r;
        sun_pos_offset_y /= sun_pos_offset_r;
    }

    sun_x = damp(sun_x, ctx.canvas.width  / 2 + sun_pos_offset_x * geolen(0.1), 1e-9);
    sun_y = damp(sun_y, ctx.canvas.height / 2 + sun_pos_offset_y * geolen(0.1), 1e-9);

    {
        ctx.translate(sun_x, sun_y);
        ctx.rotate(Math.sin(time) * 0.1);
        ctx.drawImage(katelyn, -sun_r, -sun_r, sun_r * 2, sun_r * 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.font      = `${geolen(0.06)}px Comic Sans Ms`;
    ctx.fillStyle = `rgb(${Math.cos(time)**2*256}, ${Math.sin(3.1 * time)**2*256}, 128)`;
    ctx.lineWidth = geolen(0.01);
    ctx.beginPath();
    draw_text
    (
        'my life revolves around u',
        100 + Math.sin(time) * 20,
        100 + Math.cos(time) * 20,
    );

    document.body.style.cursor = 'default';

    for (const planet of planets)
    {
        let planet_r        = geolen(0.07);
        let mouse_on_planet = Math.hypot(planet.pos_x - mouse_x, planet.pos_y - mouse_y) <= planet_r;

        if (mouse_on_planet)
        {
            document.body.style.cursor = 'grab';
        }

        planet.grabbed = mouse_down && (mouse_on_planet || planet.grabbed);

        let [gravity_x, gravity_y] = planet.grabbed ? [mouse_x, mouse_y] : [sun_x, sun_y];
        let  gravity_r             = Math.hypot(gravity_x - planet.pos_x, gravity_y - planet.pos_y);

        let [planet_acc_x, planet_acc_y] =
            planet.grabbed ? [
                (mouse_x - planet.pos_x) * 100 - planet.vel_x * 4,
                (mouse_y - planet.pos_y) * 100 - planet.vel_y * 4,
            ] : [
                (sun_x - planet.pos_x) / (gravity_r + 8)**2 * sun_mass,
                (sun_y - planet.pos_y) / (gravity_r + 8)**2 * sun_mass,
            ];

        planet_acc_x += sun_pos_offset_x * 800;
        planet_acc_y += sun_pos_offset_y * 800;

        planet.vel_x +=  planet_acc_x * delta_time;
        planet.vel_y +=  planet_acc_y * delta_time;

        planet.pos_x += (planet.vel_x * delta_time) + (0.5 * planet_acc_x * delta_time**2);
        planet.pos_y += (planet.vel_y * delta_time) + (0.5 * planet_acc_y * delta_time**2);

        const bounce_off = (pos, perp_vel, roll_vel, low, high) =>
            pos < low  ? [low ,  Math.abs(perp_vel) * random(0.4, 0.6),  roll_vel / planet_r] :
            pos > high ? [high, -Math.abs(perp_vel) * random(0.4, 0.6), -roll_vel / planet_r] : [pos, perp_vel, planet.ang_vel];

        [planet.pos_x, planet.vel_x, planet.ang_vel] = bounce_off(planet.pos_x, planet.vel_x,  planet.vel_y, planet_r, ctx.canvas.width  - planet_r);
        [planet.pos_y, planet.vel_y, planet.ang_vel] = bounce_off(planet.pos_y, planet.vel_y, -planet.vel_x, planet_r, ctx.canvas.height - planet_r);

        if (Math.hypot(planet.pos_x - sun_x, planet.pos_y - sun_y) < sun_r)
        {
            let normal_x = (planet.pos_x - sun_x) / Math.hypot(planet.pos_x - sun_x, planet.pos_y - sun_y);
            let normal_y = (planet.pos_y - sun_y) / Math.hypot(planet.pos_x - sun_x, planet.pos_y - sun_y);

            planet.pos_x = sun_x + normal_x * sun_r;
            planet.pos_y = sun_y + normal_y * sun_r;

            [planet.vel_x, planet.vel_y] =
                [
                    planet.vel_x - random(1.4, 1.8) * normal_x * (planet.vel_x * normal_x + planet.vel_y * normal_y),
                    planet.vel_y - random(1.4, 1.8) * normal_y * (planet.vel_x * normal_x + planet.vel_y * normal_y),
                ];

            if (random() < 0.25)
            {
                planet.vel_x += normal_x * 300;
                planet.vel_y += normal_y * 300;
            }
        }

        planet.ang_acc  = ((planet.vel_y * (planet.pos_x - sun_x) - (planet.pos_y - sun_y) * planet.vel_x) / (gravity_r + 64)**2 - planet.ang_vel) * 0.2;
        planet.ang_vel += planet.ang_acc * delta_time;
        planet.ang     += (planet.ang_vel * delta_time) + (0.5 * planet.ang_acc * delta_time**2);

        ctx.translate(planet.pos_x, planet.pos_y);
        ctx.rotate(planet.ang);
        ctx.drawImage(planet.img, -planet_r, -planet_r, planet_r * 2, planet_r * 2);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
};