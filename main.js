onload = () =>
{
    const ctx          = document.querySelector('canvas').getContext('2d');
    const GRAVITY      = 0.07;
    let   delta_time   = null;
    let   time         = null;
    let   planet_pos_x = 150;
    let   planet_pos_y = 150;
    let   planet_vel_x = 0;
    let   planet_vel_y = 0.75;

    const lerp = (a, b, t) => a * (1 - t) + b * t
    const damp = (a, b, k) => lerp(a, b, k * delta_time)

    const render = () =>
    {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        let sun_x = ctx.canvas.width  / 2;
        let sun_y = ctx.canvas.height / 2;

        const sun_planet_r = Math.hypot(sun_x - planet_pos_x, sun_y - planet_pos_y);
        const planet_acc_x = GRAVITY * (sun_x - planet_pos_x) / (sun_planet_r + 1)**2 * delta_time;
        const planet_acc_y = GRAVITY * (sun_y - planet_pos_y) / (sun_planet_r + 1)**2 * delta_time;

        planet_vel_x += planet_acc_x * delta_time;
        planet_vel_y += planet_acc_y * delta_time;

        planet_pos_x += (planet_vel_x * delta_time) + (0.5 * planet_acc_x * delta_time**2);
        planet_pos_y += (planet_vel_y * delta_time) + (0.5 * planet_acc_y * delta_time**2);

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
            Math.sqrt(ctx.canvas.width * ctx.canvas.height) * 0.05,
            0,
            Math.PI * 2,
        );
        ctx.fill();
    };

    const RESIZING_DONE_PIXEL_THRESHOLD = 6
    const RESIZING_DAMPENING            = 0.015
    let   resize_id                     = null;
    let   resizing                      = true;

    onresize = () =>
    {
        clearTimeout(resize_id);
        resize_id = setTimeout(() => (resizing = true), 250);
    };

    const wrapper = new_time =>
    {
        delta_time = new_time - (time ?? new_time);
        time       = new_time;

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
                ctx.canvas.width  = damp(ctx.canvas.width , innerWidth , RESIZING_DAMPENING);
                ctx.canvas.height = damp(ctx.canvas.height, innerHeight, RESIZING_DAMPENING);
            }
        }

        render();

        requestAnimationFrame(wrapper);
    };

    requestAnimationFrame(wrapper);
};
