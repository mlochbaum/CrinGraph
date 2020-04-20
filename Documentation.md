# Documentation

This page describes in detail what CrinGraph does, and sometimes how it
is implemented. It is not intended to explain how to use CrinGraph—if
you're just trying to figure out how to do some simple things with the
tool, the [readme](README.md) is more likely to help.

## Technologies

CrinGraph is written using the Javascript framework
[d3.js](https://d3js.org/). Otherwise the technology used is the
standard web stack: HTML/SVG, CSS, and Javascript. Files are written
directly with no build step.

CrinGraph targets browsers that support ES6, because d3 requires it. In
particular, the
[fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
is used to load frequency response data, so CrinGraph will not work in
Internet Explorer.

### Layout

Most parts of the interface are arranged using flexboxes, and rearranged
with CSS media queries to detect screen width and aspect ratio.

There are three main layouts:
* The desktop layout places the graph window at the top with the selector and manager side by side below it.
* The mobile layout (for narrow screens) stacks everything vertically with the selector above the manager.
* When the screen is very wide relative to its height, the selector and manager are stacked as in the mobile layout but placed right of the graph window.

If the screen is narrow enough, the toolbar below the graph window will
collapse to avoid clutter. The entire toolbar can be shown by clicking
the hamburger icon at the right.

### Searching

Headphones are searched using the fuzzy search provided by
[Fuse.js](https://fusejs.io/). This tool splits the search string and
each brand and headphone model name into words, and matches words based
on their longest common substring: it removes as few characters as
possible from both words to make them match, and then uses the number of
characters left in that match for a score. Brands and headphone models
are filtered to show only those with a high enough total matching score.

### Screenshot

Okay, it's really an export and not a screenshot. The graph is an
[SVG](https://en.wikipedia.org/wiki/Scalable_Vector_Graphics) image
drawn with d3; CrinGraph uses a lightly modified version of the
Javascript library
[saveSvgAsPng](https://github.com/exupero/saveSvgAsPng) to allow your
browser to convert it to a uniformly sized PNG image for convenient
sharing.

## Graph display

The graph window follows established standards for displaying frequency
responses. The main differences from other frequency graphs should be
aesthetic only. (Manufacturers sometimes provide graphs which have huge
loudness ranges on the vertical axis, to make their curves appear
flatter, or which display inaudible frequencies from 20kHz to 40kHz or
even higher. Such practices serve to make graphs less informative and
it's hard to take displays that use them seriously.)

### Axes

A frequency response graph uses frequency in
[hertz](https://en.wikipedia.org/wiki/Hertz) (Hz) for the horizontal or
x axis, and [sound pressure level](https://en.wikipedia.org/wiki/Sound_pressure#Sound_pressure_level)
or SPL in [decibels](https://en.wikipedia.org/wiki/Decibel) (dB) for the
vertical or y axis. Both physical quantities are plotted
logarithmically: the x axis uses a logarithmic scale in which each
octave (doubling in frequency) spans the same distance, and the y axis
uses a linear scale but the decibel is a logarithmic unit. A doubling in
sound amplitude corresponds to an increase of 6 dB (well, about 6.02).
In both cases the logarithmic scaling corresponds closely to human
perception. For frequencies the correspondence is essentially exact,
since we perceive the difference between two specific notes (say C and
F) to be the the same regardless of which octave they are in. The
difference is not a constant difference of frequencies but a constant
ratio. Using frequency in a logarithmic sense, or pitch, converts this
constant ratio into a constant distance on the screen. In fact, this
display is exactly like a piano keyboard if every key, white or black,
were given the same non-discriminatory amount of space.

### Smoothing

Graphs are displayed using a cubic
[smoothing spline](https://en.wikipedia.org/wiki/Smoothing_spline). A
smoothing spline aims to produce a curve which is both accurate to the
data and smooth (that is, not jagged). It is an exact minimum: if you
agree with the definitions of accuracy and smoothness used to define the
spline, and the tradeoff between them, then there is no way to do
better. Unlike many other smoothing strategies, the smoothing parameter
which you can adjust in the graph tool doesn't specify an octave width
or number of samples to use. It just controls how heavily smoothness is
weighted relative to accuracy. The initial value of 5 could be any
number. 5 is chosen so that numbers from 1 to 10 are all sensible
smoothing parameters to use (you could also input a decimal rather than
sticking to whole numbers, but there's not much point).

Regardless of the smoothing parameter chosen by the user, bass
frequencies are smoothed out much more than treble frequencies, by
adjusting the smoothing parameters so that smoothness is weighted more
heavily at lower frequencies and accuracy is weighted more heavily at
higher frequencies. The weighting for this adjustment was tuned manually
by looking at graphs. It has no physical basis. Technically only the
weighting for accuracy is adjusted (the smoothness weighting has to be
constant), which causes the smoothing to focus mainly on treble values
and ignore bass at very high smoothing levels. You're unlikely to learn
anything interesting about the response by setting a smoothing value in
the thousands.

If the smoothing parameter is set to 0, no smoothing is performed, and a
cardinal spline, which is something like a mixture between cubic and
linear interpolation, is used. That means the spline is no longer a
smoothing spline, which would be the same as a natural cubic spline when
the smoothing parameter is 0. This choice is made because an exact
natural spline tends to emphasize little bumps in the data, making it
worse even than linear interpolation.

Mathematically, a smoothing spline minimizes a weighted sum of:
1. All the square differences between the original and smoothed values, and
2. The integral of the square of the second derivative of the smoothed function.

The differences (1) can be weighted individually at each frequency. The
second derivative is used as a measure of smoothness because it makes
exact minimization possible, tends to correspond well with properties of
real-world data, and is also a good proxy for visual curvature
(curvature is proportional to the second derivative in flat sections of
the graph, but it is lower in sloped sections). The smoothing spline is
a natural cubic spline on a set of points with the same frequencies as
the unsmoothed data but adjusted (smoothed) dB values.

The smoothed values have the same average as the unsmoothed values. They
are also locally area-preserving, approximately, in that the average of
smoothed values over a large region will tend to be quite close to
average the original ones. This is because, if the averages differ over
a region, then the sum of squared differences over the region can be
decreased by adding the difference of averages to each smoothed value.
If the region is the entire graph, this just shifts the entire graph and
has no effect on smoothness; for a region of the graph it only has a
constant effect on smoothness since it only disrupts smoothness at the
two boundaries between that region and the rest of the graph (in fact,
by tapering off at the edges the effect on smoothness is smaller for
larger regions). In contrast the accuracy is improved by an amount
proportional to the size of the region: for a large enough region the
tradeoff must be worth it.

Graph SPL values are smoothed directly without converting them from
decibels to a non-logarithmic unit. That means the discussion above
applies only to averages and sums in decibels, which are nonphysical.
Fortunately the differences between smoothed and raw values tend to be
small, so that everything is approximately linear. The graph smoothing
is best thought of as an aesthetic tool only: it softens curves to
remove distracting noise, while representing the original data as well
as possible.

### Normalization

Normalization refers to systematically shifting graphs up or down to
align them to some standard or target, just as you might do with the
volume knob. FR curves are always displayed with some kind of
normalization: in fact, Crin's measurement tool outputs curves using its
own normalization based on total (RMS) SPL, so the "original" volume
information just isn't there! You probably aren't too interested in that
information anyway, as you'll just adjust the volume to compensate for
it, and your brain automatically adjusts for volume as well. If you do
want to know how loud a headphone is compared to others, look for a
"sensitivity" specification for the model.

The normalization settings allow you the option of normalizing according
to response at a particular frequency, or of using a weighted average
intended to measure total music volume.

Responses are smoothed before normalization, and for two-channel curves
the [average](#averaging) of the channels is used for normalization: the
channels are not normalized independently.

You can adjust headphones individually by changing the numeric input in
the manager. The number is an offset in decibels.

#### Frequency normalization

Choosing to normalize at a particular frequency (the right side, with
"Hz") simply shifts every headphone so its response at that frequency is
60dB. The value of 60dB is arbitrary; it is chosen mainly to keep
loudnesses in a double-digit range which is easier to read and a
sensible listening level.

Frequency normalization at 1kHz is a common standard for audio research.
However, the response at any particular frequency may not be
representative of the headphone's loudness as a whole. For this reason
the default normalization is based on loudness normalization which uses
the entire response curve.

#### Loudness normalization

Setting a "dB" value normalizes headphones to a target listening level
when listening to [pink noise](https://en.wikipedia.org/wiki/Pink_noise)
(which has frequency content reasonably close to ordinary music). The
proper unit for loudness is actually the
[phon](https://en.wikipedia.org/wiki/Phon), but the unit "dB" is shown
instead because of the phon's obscurity.

Even the use of "phon" is questionable: there is no standard
correspondence between speaker and in-ear sound levels, or research to
indicate how they might correspond. CrinGraph weights graphs using the
[ISO 226:2003](https://en.wikipedia.org/wiki/Equal-loudness_contour)
loudness standard (with linear rather than cubic interpolation, since it
has little effect on the average) with
[free field](https://en.wikipedia.org/wiki/Free_field_(acoustics))
compensation (which most closely matches the conditions in which that
standard was measured) to convert from speakers to IEMs. The flat bass
response of the free field compensation is set to -7 dB to produce a
graph which looks visually centered around the target loudness, and
because it approximately normalizes the free field itself to 0dB at
1kHz.
See [this Github issue](https://github.com/mlochbaum/CrinGraph/issues/1)
for information about how these decisions were made.

The resulting compensation differs smoothly by headphone volume. At low
volumes it peaks around 700Hz, and at high volumes it becomes flatter
and the peak shifts slowly down to 200Hz. When applied to an IEM with a
reasonable pinna gain, the upper mids will be most important for
normalization.

Loudness is computed by averaging the power output at each frequency
(equivalent to a [root mean square](https://en.wikipedia.org/wiki/Root_mean_square)
average of the amplitudes) to obtain the total power of the signal.
That's how physics does it; hopefully something similar is happening
inside your head. Unfortunately there is little research on this topic.
The ISO 226:2003 standard was measured using pure sine wave tones, and
so is not valid for mixtures of tones.

The headphone's frequency response only determines how it changes the
frequency response of a signal. In order to correctly determine the
loudness of headphones when playing music, you would have to know what
music is playing, and adjust it with the FR. The choice to average the
headphone's FR directly, assuming that measurements are evenly
distributed in logarithmic frequency space, corresponds to playing pink
noise through the headphones, since pink noise has its power evenly
distributed in logarithmic frequency space.

### Averaging

Curves are averaged according to sound amplitude rather than using
decibel values directly. This is roughly equivalent to placing both
sides of the headphone together to add their volume but using a source
that is half as loud.

The amplitude rather than the power is used because the sound of both
sides at a particular frequency should be coherent, or identical in
phase.

The effect of averaging in linear rather than logarithmic units (using
the amplitude and not decibel values) is that the average on the graph
is above the visual midpoint of the two channels. This makes sense: if
one side of your headphones goes out then its volume is minus infinity
decibels. Averaging directly with the other channel would give minus
infinity decibels again—total silence. But you can still hear something
from the other side! With correct averaging the average can be at most
6dB quieter than the other channel, that is, half as loud.

### Baseline

When you choose a baseline, the baseline's response (averaging both
channels if it has two) in decibels is subtracted from every curve. No
special math here.

### Highlight on mouseover

Hovering highlights the closest graph to the mouse, provided there is
one within a set maximum distance. Distance is the minimum distance to
any (smoothed) measurement in the graph, not to the cubic interpolation.
It is found by filtering the measurements to a frequency range which is
smaller than the maximum distance, then computing the distance to each
of those points.

### Channel imbalance marker

A headphone is marked with a red exclamation mark if the total channel
imbalance over any region is larger than a set maximum. The channel
imbalance is the difference in decibels of the two channels, weighted to
roll off steeply around 10kHz since higher frequencies are not as
reliable or as important for determining imbalance.

The channel imbalance for a region is signed, so if there are two
regions where the left channel is louder with a region where the right
channel is louder in between then the middle region would count against
the total for all three. The maximum imbalance over all regions is
computed with
[Kadane's algorithm](https://en.wikipedia.org/wiki/Maximum_subarray_problem).

## Aesthetics

### Colors

CrinGraph uses a sequence of colors designed so that nearby colors in
the sequence are perceptually distinct. Colors are chosen in sequence,
with one exception: colors too close in hue to a pinned headphone will
be skipped until a better one is found, giving up after three tries.

[Martin Ankerl](https://martin.ankerl.com/2009/12/09/how-to-create-random-colors-programmatically/)
describes a method which selects hues with spacing based on the golden
ratio. Spacing in this way gives a one-dimensional *low-discrepancy
sequence*: a sequence in which it takes a while for values similar to
previous ones to appear. CrinGraph extends this technique to the three
dimensions of the
[HCL color space](https://en.wikipedia.org/wiki/HCL_color_space)—hue,
chroma, and luminance. To obtain a three-dimensional low-discrepancy
sequence it uses a variation of the method described by
[Martin Roberts](http://extremelearning.com.au/unreasonable-effectiveness-of-quasirandom-sequences/),
which simply identifies different constants used for spacing in each
dimension. Because hue is by far the most important dimension for visual
distinction, and the golden ratio is the best constant for one
dimension, the method is tweaked to get a value close to it for the hue:
a four-dimensional sequence is used, with the last dimension dropped.

The low-discrepancy sequence is mapped to the entire hue range, and
sections of the chroma and luminance ranges, in HCL space. This
corresponds to a ring shape in CIELUV space, with a rectangular
cross-section along the ring, like a thick washer. Three modifications
are made to this ring in order to account for human perception, or maybe
imperfect perceptual uniformity of HCL space, or even unsuitability for
lines rather than color fields.
* Hues are shifted so cool colors like blues and greens appear less often, and reds and yellows more often.
* Hues are shifted towards six colors with evenly spaced hues—the primary and secondary colors red, yellow, green, cyan, blue, and purple.
* Chroma and luminance are shifted so that yellows are brighter and bolder, and blues darker.

Channels are separated from one another primarily by adjusting hue and
chroma. Channels with different luminance don't look related. The
exception is for blues and purples, where luminance is adjusted because
the colors are too dark to distinguish by hue.

Targets are colored using a much simpler scheme which uses the
unadjusted hue and a fixed chroma and luminance to produce greys which
differ only slightly.

### Labelling

Labels are chosen so that the label box is next to the graph it labels
but as far as possible from each other graph. Distance is measured
purely vertically, taking the minimum distance over the length of the
label, and adjusted to try to avoid the sides of the graph.

For graph peaks, every position which touches the peak and is
sufficiently far from other graphs is grouped together. The largest
distance among those positions is used, but the label is placed at their
midpoint.

No attempt is made to separate labels from each other. Usually
separating them from other graphs accomplishes this, but in some cases
it does not and they may overlap.

If there is only one label, or if a suitable position for a label can't
be found, it's placed at the top left corner. If there is a hidden
baseline curve, its label is placed at the bottom of the graph.
