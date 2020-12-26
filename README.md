# center console

> a tool for really simple console things

## what

this is a tool intended to be used to center, right, or left align your console output as a single animation frame. that means we will completely clear the screen and then vertically center and horizontally align your text.

## why

i wanted a simple way to control some output at work, but couldn't justify spending any real time on it.

## use

install

```
yarn add center-console
```

import

```js
import { CenterConsole } from 'center-console';

const log = new CenterConsole();

log.render(`

hey

`);
```

there is a type export, refer to it cuz source code rarely gets out of sync with itself, idk about these docs.

## cli-jsx

because i was bored i made this also work with a 'custom jsx transform'. so you can now layout some more interesting stuff:

```tsx
import ConsoleRender from '../';

const multiLine = `text
and
lines`;

const Splash = ({ date }: {date: any}) => <main>
  <div alignSelf='top' height={25}>
    <span alignContent="left" width={75}>logo</span>
    <span alignContent="right" width={25}>{date}</span>
  </div>
  <div alignContent="center" alignSelf='center' height={50}>
    {multiLine}
  </div>
  <div alignSelf="bottom" height={25}>
    <span alignContent="left" width={33}>left</span>
    <span alignContent="center" width={33}>right</span>
    <span alignContent="right" width={33}>centers</span>
  </div>
</main>;

const someDom = new ConsoleRender();

setInterval(() => {
  someDom.display(<Splash date={Date.now()}/>);
}, 120);
```

to use this you gotta update your babel for use with custom jsx like this:

```
module.exports = {
  presets: ['@babel/env', '@babel/typescript'],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: 'center-console/runtime', // defaults to react
      },
    ],
  ],
};
```

and make sure you make ts preserve jsx:

```
{
  "compilerOptions": {
    ... other options,
    "jsx": "preserve",
  }
}
```

this will output this:

```
logo                                                                                            1609021509768















                                                     text
                                                     and
                                                    lines















left                                               right                                            centers
```

some of the stuff is a lil off.

> todo: make the rounding good

### jsx props

there are like 4 props we accept. please use the JSX export this package provides to see what is useable.

as of now you can basically break up the terminal into heights and widths by percent and control vertical/horizontal layouts.

## prior art

at this point honestly idk.

## about the author

i like to write dev tools, this can make those tools "sparkle"

## contributing

open pr, hope i notice
