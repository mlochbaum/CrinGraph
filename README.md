# The In-Ear Graphing Library

If you're not weirdly obsessed with headphones you can leave at any time.

Crinacle is a reviewer famous around the world (at least, I'm on the
opposite side of it as he is) for his extensive reviews and measurements
of in-ear monitors (IEMs). CrinGraph is the tool which allows readers to
compare measurements against each other, and save easily readable images
to share around the internet. Although it was designed for
[Crin's site](https://crinacle.com/graphs/graphtool/),
the tool can be used freely by anyone, with no restrictions. If you're
interested in using it for your own graphs, see
[Configuring.md](Configuring.md) and ask me any about any questions that
come up.

### What are the squiggles?

The most informative headphone measurement, and the only one handled by
this tool, is the frequency response (FR) graph. An FR graph shows how
loud the headphone will render sounds at different pitches. The higher
the left portion of the graph, the more your brain will rattle; the
higher the right portion of the graph, the more your ears will bleed.
The current industry standard is a "V-shaped" response which applies
both conditions at once. Using an FR graph you may easily see which
headphones conform to this standard and which are insufficiently "fun".

### Sample graphs

This repository includes some sample data so that the tool can be shown
through Github pages. Sometimes I use this to show people features
before they're adopted on Crin's site.

[View some sample graphs.](https://mlochbaum.github.io/CrinGraph/graph.html)

Because Crinacle's frequency response measurements are not public, the
sample response curves shown are synthesized. They are not real
headphones and you can't listen to them. To reduce potential
disappointment, steps have been taken to ensure that the curves are as
uninviting as possible. Any resemblance to the exports of a large East
Asian county is purely coincidental.

## Features

If you want one that's not here, just ask so I can explain why it's a
bad idea.

### Layout

The graph tool displays:
* A graph window at the top
* The toolbar just below it
* The selector at the bottom left, or below the toolbar for narrow windows, and also a target selector
* The manager for active curves

### Graph window

* Standard logarithmic frequency (Hz) and sound pressure level (dB) [axes](Documentation.md#axes)
* [Colors](Documentation.md#colors) are persistent and algorithmically generated to ensure contrast
* Use the tabby-looking tool at the left to rescale and adjust the y axis
* [Hover](Documentation.md#highlight-on-mouseover) over or click a curve to see its name and highlight it in the manager

### Toolbar

* Zoom into bass, mid, or treble frequencies
* [Normalize](Documentation.md#normalization) with a target loudness or a normalization frequency
* [Smooth](Documentation.md#smoothing) graphs with a configurable parameter
* Toggle inspect mode to see the numeric response values when you mouse over the graph
* [Label](Documentation.md#labelling) curves inside the graph window
* Save a png [screenshot](Documentation.md#screenshot) of the graph (with labels)
* Recolor the active curves in case there is a color conflict
* Toolbar collapses and expands, along with the target selector, when the screen is small

### Headphone and target selectors

* Headphones are grouped by brand: select brands to narrow them down
* Click to select one headphone or brand and unselect others; middle or ctrl-click for non-exclusive select
* [Search](Documentation.md#searching) all brands or headphones by name
* Targets are selected the same way but are independent from headphones

### Headphone manager

* Curve names and colors are displayed here
* Choose and compare variant measurements of the same model with a dropdown
* Use the wishbone-shaped selector to see left and/or right channels or [average](Documentation.md#averaging) them together
* A red exclamation mark indicates that channels are [imbalanced](Documentation.md#channel-imbalance-marker)
* Change the offset to move graphs up and down (after [normalization](Documentation.md#normalization))
* Select [BASELINE](Documentation.md#baseline) to adjust all curves so the chosen one is flat
* Temporarily hide or unhide a graph
* PIN a headphone to avoid losing it while adding others
* Click the little dots at the bottom left to change a single headphone's [color](Documentation.md#colors)

## Contact

File a Github issue here for topics related to the project. You can also
reach me by the email in my Github profile and the [LICENSE](LICENSE).
I can sometimes be found on
[Crin's Discord server](https://discord.gg/CtTqcCb) where I am
creatively named Marshall.
