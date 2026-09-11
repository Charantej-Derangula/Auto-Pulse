import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App.jsx';
try {
  const html = renderToString(React.createElement(App));
  console.log("RENDER SUCCESS");
} catch (e) {
  console.error("RENDER ERROR:", e);
}
