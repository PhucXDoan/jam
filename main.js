"use strict";

onload = () =>
{
    const exhibit = new URLSearchParams(location.search).get("exhibit") ?? "planets";

    new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = `./exhibits/${exhibit}.js`;
        script.onerror = reject;
        script.onload  = resolve;
        document.body.appendChild(script);
    }) .catch (e => {
        console.error(e);
    });
};