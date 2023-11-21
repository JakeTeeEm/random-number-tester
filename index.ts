import { Worker } from "worker_threads";


/** Checks to see if a random number passes an rng check
* Function input determines likelyhood of pass
* Percentage based off of 0->1, and how often you want it to pass

* Skew (optional) is also based off of 0->1, but could be greater than 1;
*                     less than 0 would not make any difference
* @returns True or False
*/
export async function randomNumberCheck(percentage: number, skew: number = 0) {
    const randomNumber = Math.random();

    // The super formula >:]]]
    // f(x) = ax - x - a + 1;  x = percentage, a = percentage skew
    const formula = (skew * percentage) - percentage - skew + 1;

    if (randomNumber > formula) {
        return true;
    } else {
        return false;
    }
}

// Command functions
/** @returns Heads, Tails, or rarely Side */
export async function flipACoin(): Promise<String> {
    if (await randomNumberCheck(.0001666)) {
        return `Side`;
    }
    else {
        return `L`;
    }
}


function chunkify(array: any, n: any) {
    let chunks = [];

    for (let i = n; i > 0; i--) {
        chunks.push(array.splice(0, Math.ceil(array.length / i)));
    }

    return chunks;
}

async function run(jobs: any, concurrentWorkers: any) {
    const chunks = chunkify(jobs, concurrentWorkers);

    let completedWorkers = 0;

    chunks.forEach((data, i) => {
        const worker = new Worker(`./worker.ts`);

        const tick = performance.now();

        worker.postMessage(data);

        worker.on(`message`, () => {
            console.log(`Worker ${i} completed...`);

            completedWorkers++;

            if (completedWorkers === concurrentWorkers) {
                console.log(`${concurrentWorkers} workers took ${performance.now() - tick} ms.`);

                process.exit();
            }
        });
    });
}



(async () => {
    let t = 0;

    const trials = 900_000_000

    const jobs = Array.from({length: 100}, () => 1e9);

    const tick = performance.now();

    // for (let i = 0; i < trials; i++) {
    //     if (await flipACoin() === `Side`) {
    //         t++;
    //     }
    // }
    await run(jobs, 9);

    const tock = performance.now();

    console.log(`Coin landed on its side ${t} (out of ${trials}) times!\n\t( Probability:  ${(t / trials) * 100}% )\n\tExecuted in ${tock - tick} ms...`);
})();