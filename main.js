onload = () =>
{
    const ctx            = document.querySelector('canvas').getContext('2d');
    let   delta_time     = null;
    let   time           = null;
    let   mouse_x        = 0;
    let   mouse_y        = 0;
    let   mouse_down     = false;
    const sun_mass       = 100_000;
    let   planet_pos_x   = 350;
    let   planet_pos_y   = 350;
    let   planet_vel_x   = 0;
    let   planet_vel_y   = 250;
    let   planet_ang     = 0;
    let   planet_ang_vel = 0;
    let   planet_ang_acc = 0;
    let   planet_grabbed = false;

    const lerp  = (a, b, t       ) => a * (1 - t) + b * t;
    const damp  = (a, b, k       ) => lerp(a, b, k ** delta_time);
    const wedge = (ax, ay, bx, by) => ax * by - ay * bx;

    const phuc = new Image();
    phuc.src = './data/phuc.png';

    const katelyn = new Image();
    katelyn.src = './data/katelyn.png';

    const update = () =>
    {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const sun_x           = ctx.canvas.width  / 2;
        const sun_y           = ctx.canvas.height / 2;
        const sun_r           = Math.sqrt(ctx.canvas.width * ctx.canvas.height) * 0.15;
        const planet_r        = Math.sqrt(ctx.canvas.width * ctx.canvas.height) * 0.1;
        const mouse_on_planet = Math.hypot(planet_pos_x - mouse_x, planet_pos_y - mouse_y) <= planet_r;

        document.body.style.cursor = mouse_on_planet ? 'grab' : 'default';
        planet_grabbed             = mouse_down && (mouse_on_planet || planet_grabbed);

        const [gravity_x, gravity_y] = planet_grabbed ? [mouse_x, mouse_y] : [sun_x, sun_y];
        const  gravity_r             = Math.hypot(gravity_x - planet_pos_x, gravity_y - planet_pos_y);

        const [planet_acc_x, planet_acc_y] =
            planet_grabbed ? [
                (mouse_x - planet_pos_x) * 100 - planet_vel_x * 4,
                (mouse_y - planet_pos_y) * 100 - planet_vel_y * 4,
            ] : [
                (sun_x - planet_pos_x) / (gravity_r + 8)**2 * sun_mass,
                (sun_y - planet_pos_y) / (gravity_r + 8)**2 * sun_mass,
            ];

        planet_vel_x +=  planet_acc_x * delta_time;
        planet_vel_y +=  planet_acc_y * delta_time;

        planet_pos_x += (planet_vel_x * delta_time) + (0.5 * planet_acc_x * delta_time**2);
        planet_pos_y += (planet_vel_y * delta_time) + (0.5 * planet_acc_y * delta_time**2);

        const bounce_off = (pos, perp_vel, roll_vel, low, high) =>
                pos < low  ? [low ,  Math.abs(perp_vel) * 0.5,  roll_vel / planet_r] :
                pos > high ? [high, -Math.abs(perp_vel) * 0.5, -roll_vel / planet_r] : [pos, perp_vel, planet_ang_vel];

        [planet_pos_x, planet_vel_x, planet_ang_vel] = bounce_off(planet_pos_x, planet_vel_x,  planet_vel_y, planet_r, ctx.canvas.width  - planet_r);
        [planet_pos_y, planet_vel_y, planet_ang_vel] = bounce_off(planet_pos_y, planet_vel_y, -planet_vel_x, planet_r, ctx.canvas.height - planet_r);

        planet_ang_acc  = ((planet_vel_y * (planet_pos_x - sun_x) - (planet_pos_y - sun_y) * planet_vel_x) / (gravity_r + 64)**2 - planet_ang_vel) * 0.2;
        planet_ang_vel += planet_ang_acc * delta_time;
        planet_ang     += (planet_ang_vel * delta_time) + (0.5 * planet_ang_acc * delta_time**2);

        {
            ctx.translate(sun_x, sun_y);
            ctx.rotate(Math.sin(time) * 0.1);
            ctx.drawImage(katelyn, -sun_r, -sun_r, sun_r * 2, sun_r * 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }

        {
            ctx.translate(planet_pos_x, planet_pos_y);
            ctx.rotate(planet_ang);
            ctx.drawImage(phuc, -planet_r, -planet_r, planet_r * 2, planet_r * 2);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
        }
    };

    const RESIZING_DONE_PIXEL_THRESHOLD = 6
    let   resize_id                     = null;
    let   resizing                      = true;

    onresize = () =>
    {
        clearTimeout(resize_id);
        resize_id = setTimeout(() => (resizing = true), 250);
    };

    onmousemove = e =>
    {
        mouse_x = e.x - ctx.canvas.offsetLeft;
        mouse_y = e.y - ctx.canvas.offsetTop;
    };

    onmousedown = e => mouse_down = true;
    onmouseup   = e => mouse_down = false;

    ctx.canvas.width  = innerWidth;
    ctx.canvas.height = innerHeight;

    const wrapper = new_time_ms =>
    {
        delta_time = new_time_ms / 1000 - (time ?? new_time_ms / 1000);
        time       = new_time_ms / 1000;

        if (delta_time < 0.100)
        {
            if (resizing)
            {
                if
                (
                    Math.abs(ctx.canvas.width  - innerWidth ) < RESIZING_DONE_PIXEL_THRESHOLD &&
                    Math.abs(ctx.canvas.height - innerHeight) < RESIZING_DONE_PIXEL_THRESHOLD
                )
                {
                    ctx.canvas.width  = innerWidth;
                    ctx.canvas.height = innerHeight;
                    resizing          = false;
                }
                else
                {
                    ctx.canvas.width  += damp(0, (innerWidth  - ctx.canvas.width ) * 0.25, 0.1);
                    ctx.canvas.height += damp(0, (innerHeight - ctx.canvas.height) * 0.25, 0.1);
                }
            }

            update();
        }

        requestAnimationFrame(wrapper);
    };

    requestAnimationFrame(wrapper);
};
