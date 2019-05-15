# The In-Ear Graphing Library

If you're not weirdly obsessed with headphones you can leave at any time.

Crinacle is a reviewer famous around the world (at least, I'm on the
opposite side of it as he is) for his extensive reviews and measurements
of in-ear monitors (IEMs). Until now his measurements have been shared
with the general public through the medium of .jpg, which has some
limitations when it comes to interactivity. This project is an attempt
to rectify these issues.

The most informative headphone measurement, and the only one handled by
this tool, is the frequency response (FR) graph. An FR graph shows how
loud the headphone will render sounds at different pitches. The higher
the left portion of the graph, the more your brain will rattle; the
higher the right portion of the graph, the more your ears will bleed.
The current industry standard is a "V-shaped" response which applies
both conditions at once. Using an FR graph you may easily see which
headphones conform to this standard and which are insufficiently "fun".

[View some sample graphs.](https://mlochbaum.github.io/CrinGraph/graph.html)

Because Crinacle's frequency response measurements are not public, the
sample response curves shown here are synthesized. They are not real
headphones and you can't listen to them. To reduce potential
disappointment, steps have been taken to ensure that the curves are as
uninviting as possible. Any resemblence to the exports of a large East
Asian county is purely coincidental.

The following features are planned for the crinacle.com graphing tool:

### Graph window

* An aesthetically pleasing and intuitive display ✔
* Colors are persistent and algorithmically generated to ensure contrast ✔…
* Range controls to zoom in on bass, mids, or treble ✔
* Ability to rescale and adjust the y axis (SPL in decibels) ✔
* Allow the user to select a smoothing function
* Ability to drag graphs up and down?

### Headphone manager

* Choose to see both left and right channels or average them together ✔…
* Set one response as the "baseline", adjusting all curves so that it is flat ✔
* Select ordering and color of headphones or reset/regenerate colors
* Temporarily hide a headphone (or channel?) ✔
* Set normalization: adjust graphs up and down, or fix the gain at a particular frequency
* Links to reviews or ratings?

### Headphone selector

* Headphones grouped by brand ✔
* Click to select one headphone or brand and unselect others; middle or ctrl-click for non-exclusive select ✔
* Search all brands or headphones by name ✔
* Search by driver configuration?
* Filter by some algorithmically determined FR descriptors (bassy, bright, etc.)?

### Entire page

* Headphones in the selector, manager, and graph are linked so that hovering over one highlights the others …
* Effective resizing and mobile friendliness
* Multiple layouts to give more or less space to the graph versus selection tools?
