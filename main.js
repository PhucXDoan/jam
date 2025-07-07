onload = () =>
{
    const ctx            = document.querySelector('canvas').getContext('2d');
    let   delta_time     = null;
    let   time           = null;
    let   mouse_x        = 0;
    let   mouse_y        = 0;
    let   mouse_dx       = 0;
    let   mouse_dy       = 0;
    let   mouse_down     = false;
    let   planet_pos_x   = 350;
    let   planet_pos_y   = 150;
    let   planet_vel_x   = 0;
    let   planet_vel_y   = 0.1;
    let   planet_grabbed = false;

    const lerp = (a, b, t) => a * (1 - t) + b * t
    const damp = (a, b, k) => lerp(a, b, k ** delta_time)

    const update = () =>
    {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const sun_x    = ctx.canvas.width  / 2;
        const sun_y    = ctx.canvas.height / 2;
        const planet_r = Math.sqrt(ctx.canvas.width * ctx.canvas.height) * 0.05;

        const mouse_on_planet = Math.hypot(planet_pos_x - mouse_x, planet_pos_y - mouse_y) <= planet_r;

        document.body.style.cursor = mouse_on_planet ? 'grab' : 'default';
        planet_grabbed             = mouse_down && (mouse_on_planet || planet_grabbed);

        let planet_acc_x = null;
        let planet_acc_y = null;

        if (planet_grabbed)
        {
            planet_acc_x = (mouse_x - planet_pos_x) * 100 - planet_vel_x * 4;
            planet_acc_y = (mouse_y - planet_pos_y) * 100 - planet_vel_y * 4;
        }
        else
        {
            const gravity_r = Math.hypot(sun_x - planet_pos_x, sun_y - planet_pos_y);
            planet_acc_x = (sun_x - planet_pos_x) / (gravity_r + 8)**2 * 100_000;
            planet_acc_y = (sun_y - planet_pos_y) / (gravity_r + 8)**2 * 100_000;
        }

        planet_vel_x += planet_acc_x * delta_time;
        planet_vel_y += planet_acc_y * delta_time;

        planet_pos_x += (planet_vel_x * delta_time) + (0.5 * planet_acc_x * delta_time**2);
        planet_pos_y += (planet_vel_y * delta_time) + (0.5 * planet_acc_y * delta_time**2);

        const bounce_off = (pos, vel, low, high) =>
                pos < low  ? [low ,  Math.abs(vel) * 0.5] :
                pos > high ? [high, -Math.abs(vel) * 0.5] : [pos, vel];

        [planet_pos_x, planet_vel_x] = bounce_off(planet_pos_x, planet_vel_x, planet_r, ctx.canvas.width  - planet_r);
        [planet_pos_y, planet_vel_y] = bounce_off(planet_pos_y, planet_vel_y, planet_r, ctx.canvas.height - planet_r);

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc
        (
            sun_x,
            sun_y,
            Math.sqrt(ctx.canvas.width * ctx.canvas.height) * 0.10,
            0,
            Math.PI * 2,
        );
        ctx.fill();

        ctx.fillStyle = 'green';
        ctx.beginPath();
        ctx.arc
        (
            planet_pos_x,
            planet_pos_y,
            planet_r,
            0,
            Math.PI * 2,
        );
        ctx.fill();
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
        mouse_x  = e.x - ctx.canvas.offsetLeft;
        mouse_y  = e.y - ctx.canvas.offsetTop;
        mouse_dx = e.movementX;
        mouse_dy = e.movementY;
    };

    onmousedown = e => mouse_down = true;
    onmouseup   = e => mouse_down = false;

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
