# Lyra

Lyra is an interactive environment that enables custom visualization design without writing any code. Graphical “marks” can be bound to data fields using property drop zones; dynamically positioned using connectors; and directly moved, rotated, and resized using handles. Lyra also provides a data pipeline interface for iterative visual specification of data transformations and layout algorithms. Lyra is more expressive than interactive systems like Tableau, allowing designers to create custom visualizations comparable to hand-coded visualizations built with D3 or Processing. These visualizations can then be easily published and reused on the Web.

**This is the working branch for Lyra 2 and does not contain all functionality.**
A deployed version of [Lyra 1 is available online](http://idl.cs.washington.edu/projects/lyra/). For more information, check out the [Lyra wiki](https://github.com/uwdata/lyra/wiki).

## Local Development

### Installation

To work on Lyra locally, you must have [Node](https://nodejs.org/) installed on your computer. Download this repository with Git, then (from the command prompt or terminal) check out the `lyra2` development branch with the command

```sh
git checkout lyra2
```

Once you are on the lyra2 branch, run

```sh
npm install
```

to install the project's code dependencies.

To build the application itself, execute the build command:

```sh
npm run build
```

Lyra is now ready to run. Start the local webserver with the command:

```sh
npm start
```

Lyra should now be running at [http://localhost:8080](http://localhost:8080)! This web server will auto-reload when you change the JavaScript code; manually re-building with `npm run build` should only be necessary if you update the SCSS stylesheets.

A deployed version of Lyra is [available online](http://idl.cs.washington.edu/projects/lyra/). For more information, check out the [Lyra wiki.](https://github.com/uwdata/lyra/wiki)

# Running locally

You can run lyra locally with [docker](https://docs.docker.com/).

    # Build
    sudo docker build -t uwdata/lyra .

    # Serves on port 9009
    sudo docker run -d -p 9009:8080 uwdata/lyra
