
// Returns a random number in the range [min, max]
export function randomRange(min, max) {
  return Math.floor(Math.random() * (max + 1 - min) + min);
}

export function randomChoice(val1, val2)
{
  return [val1, val2][Math.round(Math.random())];
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function Logarithm(b, n) {
  return Math.log(n) / Math.log(b);
}

export function GetLayers(n) {
  let layer = 0;
  let t = n;
  while (t > 0)
  {
    t = (t - 3) / 2
    layer += 1;
  }
  return layer;
}

// An implementation of the Durstenfeld shuffle
export function Shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--)
  {
    const j = randomRange(0, i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

let usernames = ["mildzebra", "workmancoffee", "sailordrone", "roadman", "classicferret", "cookiesleather", "milkysweep", "bakeleather", "skilletsocial", "picklespipe", "remotehumor"]

export function GetRandomUserName()
{
  return `${usernames[randomRange(0,usernames.length - 1)]}${randomRange(0,100)}`;
}
