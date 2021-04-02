# CrinGraph on your own site

This guide explains the steps required to make CrinGraph display your
own FR graphs, for example if by some remarkable circumstance you have
managed to measure IEMs not yet on crinacle.com. If you have any trouble
with setting CrinGraph, or any questions about the tool, just ask me!
Use Github or the email in my profile.

There are two other steps to show people FR graphs that I may not be
able to help with:

* Creating frequency response graphs in the first place. I have never
  done this and don't know all the details. You might try reading
  [this thread](https://www.head-fi.org/threads/general-iem-measurements-discussions.903455/)
  for some information to get you started, and Crin is generally happy
  to answer questions about measurement on [his Discord server](https://discord.gg/CtTqcCb).
* Hosting the pages. Believe it or not, I'm not a web developer and I
  don't know that much about setting up websites. One method that may
  work for your purposes is to use Github Pages, which allows you to
  serve the contents of any Github repository as a website. The main
  CrinGraph repository includes sample data so it can function on its
  own. Once I had the data I just set the source to "master branch" in
  the settings under "Github Pages", and Github put the page at
  https://mlochbaum.github.io/CrinGraph/graph.html. You can show your
  graphs in the same way by forking my repository and making the changes
  described here, then changing the "Github Pages" setting like I did.

## Checklist

These are the things you definitely need to change to make sure your
page works and isn't claiming it's crinacle.com.

* Set `DIR` in `config.js` and place your graphs and `phone_book.json`
  there.
* Remove or change the watermark.
* Remove the `targets`, replace them with your own, or get permission
  from Crinacle to use the ones in the CrinGraph repository.
* If you are using a free/premium model, change `premium_html` in
  `config_free.js` to point to your own site(s).

## Configuring CrinGraph

The main page used to display graphs is [graph.html](graph.html), which
defines the basic structure of a page and then includes a bunch of
Javascript files that do the real work (at the end of the file).
[graph_free.html](graph_free.html) is identical but uses a different 
configuration file to remove some functionality. You will only need to
use it if you intend to have both a free and a paid graph tool.

Ideally all configuration can be done simply by changing
[config.js](config.js). However, there are currently not very many
configuration options. Ask if there's something you want to change but
can't!

Here are the current configuration parameters:

* `DIR` is the location of your FR graphs and the index for them
  (see the next section). If you are displaying a cloned repository
  using Github Pages, using a directory other than `data/` will make
  merging changes from the main CrinGraph repository easier.
* `tsvParse` is a function which takes the text of an FR file and
  converts it to the format used internally by CrinGraph. See the next
  section.
* `watermark` is a function that is applied once to the graph window on
  startup. The argument `svg` is a [d3](https://d3js.org/) selection
  and you can use any d3 functionality to draw things in it. This part
  must be changed, or you will end up impersonating crinacle.com! To
  use no watermark, just delete the whole function body. You can also
  delete, move, or change the image and text separately.
* `max_channel_imbalance` controls how sensitive the channel imbalance
  detector (that red exclamation mark that can show up in a headphone's
  key) is. You probably don't need to change this.
* `targets` lists the available target frequency responses. If you don't
  want to display any targets set it to `false`. If you do use targets,
  each one should be a file named `... Target.txt` in the `DIR`
  directory you specified. The targets which are already there were
  provided by Crinacle so make sure you have his permission before using
  them.
* `scale_smoothing` (default 1) adjusts the level of smoothing applied
  at a given "Smooth:" setting. The setting will always start at 5, but
  its value is multiplied by `scale_smoothing` to get the actual level
  of smoothing.

The following parameters can be set to configure a restricted version
of the graph tool. They are only present in
[config_free.js](config_free.js). If you don't set them the tool will
be unrestricted.

* `max_compare` is the maximum number of graphs allowed at a time.
* `disallow_target` prevents target FRs from ever being loaded.
* `allow_targets` is a list of target names, and overrides
  `disallow_target` for those targets, so they can be loaded. If
  `disallow_target` isn't set, it has no effect.
* `premium_html` is the message shown when a user tries to do something
  which isn't allowed according to the previous two settings. Given that
  it points to Crinacle's patreon and not yours, you probably want to
  change it.

The following parameters are used to allow multiple samples per channel
and different channel configurations than L/R. For example,
`config_hp.js` is intended for headphones and shows only the right
channel with five samples per channel.

* `default_channels` is a list of channels in each measurement: it
  defaults to `["L","R"]`. It's called "default" because I may add a
  mechanism to change it for a single sample from `phone_book.json`,
  but no such mechanism exists right now.
* `num_samples`, if set, is the number of samples in each channel.
  Samples are always numbered 1 to `num_samples`.

The following parameters are for setting the initial samples to display,
and enabling URL sharing. If enabled, URL sharing updates the page URL
to reflect which samples are on the graph. Copying and opening that URL
will open the page with those samples shown. For these parameters a
headphone or target is identified by its filename.

* `init_phones` is a list of filenames to open by default.
* `share_url` enables URL sharing.
* `page_title` sets the page title display if URL sharing is enabled.

## Storing your FR files

All FR data is stored in its own file in the directory `DIR` you specify
in `config.js`. To use this data, CrinGraph needs two things: an index
which lists the available models, grouped by brand, and the FR curves
themselves.

### FR index: `phone_book.json`

The index is a [JSON](https://en.wikipedia.org/wiki/JSON) file called
[phone_book.json](data/phone_book.json). By default it is located in the
headphone directory `DIR`, but the setting `PHONE_BOOK` allows you to
specify a different filepath. The file's contents are a list of brands,
where each brand is a list of models. A simple example of a brand:

```json
  {
    "name":   "Elysian",
    "suffix": "Acoustic Labs",
    "phones": [ "Artemis"
              , "Eros"
              , "Minerva"
              , "Terminator" ]
  }
```

The only required attributes for a brand are its name ("name") and a
list of headphone models ("phones"). You can also add another part of
the name using "suffix". The suffix is included in the brand name when
it's used alone, but not as part of a model name: here the brand is
"Elysian Acoustic Labs", but the first headphone is the "Elysian Artemis".

Each item in the "phones" array corresponds to a single headphone model.
While an item might just be the model name as shown above, there are
other possibilities as well. Two examples should cover most use cases:

* To use a different display name ("name") and filename ("file"): `{"name":"Carbo Tenore ZH-DX200-CT","file":"Tenore"}`
* To use show multiple variants of a single model: `{"name":"Gemini","file":["Gemini","Gemini Bass"]}`

The full list of options is as follows:

* "name" is the displayed model name.
* "collab" gives the name of a collaborator. If that collaborator is on
  the list of brands, the headphone will be categorized under both the
  main vendor and the collaborator.
* "file" gives either a single filename or a list. If a list is given,
  then "name" is used only to for the headphone's name in the selection
  menu. The key will use filenames for display unless one of the following
  options is specified.
* "suffix" is a list with the same length as the list of files. The
  display name is the model name plus the variant's suffix. So              , {"name":"R3","file":["R3","R3 C"],"suffix":["","Custom"]} ]
  `{"name":"R3","file":["R3","R3 C"],"suffix":["","Custom"]}` uses files
  based on the names `R3` and `R3 C` but shows the names "R3" and
  "R3 Custom".
* "prefix" is some string that should appear at the start of each
  filename. The display name is then the filename, except that if the
  prefix appears at the start of the filename it is replaced with the
  display name. So
  `{"name":"IER-Z1R","file":["Z1R S2","Z1R S3","Z1R S4","Z1R S5","Z1R S6","Z1R","Z1R Filterless"],"prefix":"Z1R"}`
  displays with the names `IER-Z1R S2`, `IER-Z1R S3`, and so on.
  You may not need this one because you probably won't measure as many
  IER-Z1Rs as Crinacle.

### FR curves

Each frequency response curve (each channel of a headphone, and each
target response) is stored in its own file. For targets this file must
be named using the target name from `config.js` followed by " Target.txt",
for instance "Diffuse Field Target.txt". For headphones the file's name
is obtained from `phone_book.json` as described in the previous section.
When a user selects a headphone, CrinGraph figures out its filename—for
concreteness let's say "New Primacy"—and looks for two files, one for
each channel. Here it would try to read "New Primacy L.txt" and
"New Primacy R.txt". If one channel is not found it will ignore it and
display the headphone with only one channel. If neither one is found it
pops up an alert to say "Headphone not found!" and doesn't display
anything.

The headphone is converted from a text file to a Javascript array
using the setting `tsvParse`. The default setting assumes that the file
is a tab-separated value file, with two header lines which are discarded
followed by 480 measurements (1/48 octave spacing). Each measurement is
a frequency and an SPL value. Of course, you can use any format, as long
as you can write the code to parse it!
