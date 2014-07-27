---
title: Wikismith
subtitle: Static site generator for fans of bower and gulp
module: bs3
---

# Barcamp Rules

Wikismith is an open-source node package that optimized for programmer happiness.  It works transparently with gulp and bower and favors coding over configuration.

##Lorem Ipsum

[[Lorem ipsum]] dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

Nam dictum sapien a velit rhoncus condimentum.
orem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
t magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget tincidunt
mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique vulputate. Sed lobortis,
purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia neque neque et eros. Vestibulum
mauris purus, pharetra in felis mollis, bibendum faucibus nisi. Nam dictum sapien a velit rhoncus
condimentum.

##Duis Viverra

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Code Examples

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

```javascript
    wikismith.watch_modules()
        .pipe(wikismith.build_module_assets())
        .pipe(wikismith.module_pages())
        .pipe(wikismith.render_page())
        .pipe(wikismith.wiki())
        .pipe(wikismith.unfolder_index())
        .pipe(gulp.dest('build'))
        .pipe(es.map(function(file, cb) {
            lr.changed({body: { files: [file.path] }});
            cb(null, file);
        }))
```
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Quisque interdum

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Cras Varius

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Praesent Tempor

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Quisque interdum2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Cras Varius2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

##Praesent Tempor2

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis suscipit risus nec lacinia pharetra.
Ut magna diam, varius eu elementum vel, suscipit a magna. Nulla ullamcorper sagittis elit, eget
tincidunt mi lobortis sollicitudin. Aliquam pretium est dui, eget ullamcorper diam tristique
vulputate. Sed lobortis, purus sit amet condimentum rhoncus, eros nunc cursus mauris, vel lacinia
neque neque et eros. Vestibulum mauris purus, pharetra in felis mollis, bibendum faucibus nisi.
