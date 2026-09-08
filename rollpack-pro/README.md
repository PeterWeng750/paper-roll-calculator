# RollPack Pro — source code

Includes the latest top and side views, loading calculations, Thai interface,
metric/imperial units, container presets, and mobile layout.

## Open the app

Extract this ZIP, then open index.html in your browser.
No package installation or build step is required.

For local HTTP development, run this command from the extracted folder:

    python -m http.server 8000

Then open http://localhost:8000 in your browser.
You can open the extracted folder in VS Code or Antigravity to edit it.

## Files

- index.html: page structure, Thai labels, and all CSS styles.
- app.js: packing calculations, validation, controls, top view, and side view.
- icon.svg: app icon.
- manifest.webmanifest: web app metadata.
- sw.js: service worker lifecycle support; no offline caching.

Keep these files together. To host the app, serve this folder as static files.
Home-screen installation depends on the browser and HTTPS hosting.

## Side view

Select ด้านข้าง above the diagram. It shows all loaded layers, ceiling space,
and the door-height reference. Rolls behind one another can overlap in the
projection; × indicates the count at the same projected position.
Select ด้านบน to return to the per-layer top view.

## Calculation limits

The app estimates loading for identical rolls using the entered dimensions
and payload. It does not certify loading safety, load distribution, stacking
strength, lifting access, or legal compliance. Packing materials and securing
equipment are not included. Container presets are editable sample values.
