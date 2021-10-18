
export function throttle(func: (...args: any) => void, ms: number, rate: number, ...extralArgs: any) {
    let timeout: any;
    let startTime = new Date();

    return function (...args: any) {
        let curTime = new Date();

        clearTimeout(timeout);

        if (curTime.getTime() - startTime.getTime() >= rate) {
            func(...args, ...extralArgs);
            startTime = curTime;
        } else {
            timeout = setTimeout(() => {
                func(...args, ...extralArgs);
            }, ms);
        }
    };
};
