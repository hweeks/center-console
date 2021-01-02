# center console

> jsx for your terminal

## what

this will allow you to layout dynamic console output with an increasingly html complete api as i flesh out features

## why

i wanted a simple way to control some output at work, but couldn't justify spending any real time on it.

## install

```
yarn add center-console
```

## jsx interface

thanks to babel and it's custom transform for jsx stuff, along with typescript support, we have been able to create a custom 'dom like' and 'react inspired' `c-dom`. Our render function relies on this 'createElement' function to build the children, and to use the fiber based dom processor.

```tsx
import {ConsoleRender, Component} from 'center-console';

const multiLine = `text
and
lines`;

const MultiDiv = ({ children } : {children: string}) => <div alignContent="center" alignSelf='center' height={50}>
  {children}
</div>;

class StatefulSplash extends Component {
  interval?: NodeJS.Timer

  startTime: number

  constructor(...props) {
    super(...props);
    this.interval = null;
    this.state = {
      date: 0,
    };
    this.startTime = Date.now();
    this.interval = setInterval(() => {
      this.setState({
        date: Date.now() - this.startTime,
      });
    }, 1000);
  }

  render() {
    const { date } = this.state;
    const runTime = `running for ${date}ms`;
    return <main>
      <div alignSelf='top' height={25}>
        <span alignContent="left" width={75}>logo</span>
        <span alignContent="right" width={25}>{runTime}</span>
      </div>
      <MultiDiv>{multiLine}</MultiDiv>
      <div alignSelf="bottom" height={25}>
        <span alignContent="left" width={33}>left</span>
        <span alignContent="center" width={33}>right</span>
        <span alignContent="right" width={33}>centers</span>
      </div>
    </main>;
  }
}

const someDom = new ConsoleRender();
someDom.display(<StatefulSplash />);
```

this will output this:

```
logo                                          running for 1000ms












                              text
                              and
                             lines












left                         right                      centers
```

### babel config

to use this you gotta update your babel for use with custom jsx like this:

```
module.exports = {
  presets: ['@babel/env', '@babel/typescript'],
  plugins: [
    [
      '@babel/plugin-transform-react-jsx',
      {
        runtime: 'automatic',
        importSource: 'center-console/runtime',
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
### jsx props

there are like 4 props we accept. please use the JSX export this package provides to see what is useable.

as of now you can basically break up the terminal into heights and widths by percent and control vertical/horizontal layouts.

### old school api (still totally cool and very legal)

import

```js
import { CenterConsole } from 'center-console';

const log = new CenterConsole();

log.render(`

hey

`);
```

there is a type export, refer to it cuz source code rarely gets out of sync with itself, idk about these docs.

## prior art

at this point honestly idk.

## about the author

i like to write dev tools, this can make those tools "sparkle"

## contributing

open pr, pass lint and commit style, merge
