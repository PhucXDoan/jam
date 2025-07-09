"use strict";

const lerp      = (a, b, t       ) => a * (1 - t) + b * t;
const damp      = (a, b, k       ) => lerp(a, b, k ** delta_time);
const random    = (a = 0, b = 1)   => lerp(a, b, Math.random())
const geolen    = k                => Math.sqrt(ctx.canvas.width * ctx.canvas.height) * k;
const draw_text = (text, ...rest)  => {
    ctx.strokeText(text, ...rest);
    ctx.fillText(text, ...rest);
};

let ctx        = document.querySelector('canvas').getContext('2d');
let delta_time = null;
let time       = null;
let keys       = {};
let mouse_x    = 0;
let mouse_y    = 0;
let mouse_down = false;

onload = () =>
{
    ctx.canvas.width  = innerWidth;
    ctx.canvas.height = innerHeight;

    const exhibit = new URLSearchParams(location.search).get("exhibit") ?? "planets";

    new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `./exhibits/${exhibit}.js`;
        script.onerror = reject;
        script.onload  = resolve;
        document.body.appendChild(script);
    }).then(e => {
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
        onkeyup     = e => keys[e.code] = false;
        onkeydown   = e => keys[e.code] = true;

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
    }).catch (e => {
        console.error(e);
    });
};