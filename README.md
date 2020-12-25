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

## prior art

there was a tool called log update, this is my version of that with alignment.

## about the author

i like to write dev tools, this can make those tools "sparkle"
