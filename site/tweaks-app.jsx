/* tweaks-app.jsx — Visual direction switcher + detail tweaks.
   Mounts its own React root into #tweaks-root. The page itself is vanilla;
   this only drives CSS variables / attributes on <html> and the Leaflet map. */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "neblina",
  "mapStyle": "mapa",
  "customAccent": false,
  "accent": "#3f5aa8",
  "textSize": 17
}/*EDITMODE-END*/;

function __isLight(hex) {
  const h = String(hex).replace('#', '');
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h.padEnd(6, '0');
  const n = parseInt(x.slice(0, 6), 16);
  if (Number.isNaN(n)) return true;
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return r * 299 + g * 587 + b * 114 > 150000;
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', t.direction);

    if (t.customAccent) {
      root.style.setProperty('--accent', t.accent);
      root.style.setProperty('--on-accent', __isLight(t.accent) ? '#1a130b' : '#fbf8f0');
      root.style.setProperty('--halo', t.accent + '26');
    } else {
      root.style.removeProperty('--accent');
      root.style.removeProperty('--on-accent');
      root.style.removeProperty('--halo');
    }

    document.body.style.fontSize = t.textSize + 'px';

    if (typeof window.MLG_setMapStyle === 'function') window.MLG_setMapStyle(t.mapStyle);
  }, [t.direction, t.customAccent, t.accent, t.textSize, t.mapStyle]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Direção visual" />
      <TweakRadio
        label="Tema"
        value={t.direction}
        options={[
          { value: 'barroso', label: 'Barroso' },
          { value: 'neblina', label: 'Neblina' },
          { value: 'sexta13', label: 'Sexta 13' }
        ]}
        onChange={(v) => setTweak('direction', v)}
      />

      <TweakSection label="Mapa" />
      <TweakRadio
        label="Estilo"
        value={t.mapStyle}
        options={[
          { value: 'mapa', label: 'Mapa' },
          { value: 'claro', label: 'Claro' },
          { value: 'satelite', label: 'Satélite' }
        ]}
        onChange={(v) => setTweak('mapStyle', v)}
      />

      <TweakSection label="Detalhes" />
      <TweakToggle label="Acento personalizado" value={t.customAccent}
                   onChange={(v) => setTweak('customAccent', v)} />
      {t.customAccent && (
        <TweakColor label="Acento" value={t.accent}
                    options={['#b35a33', '#4f7d5a', '#3f5aa8', '#c0892f']}
                    onChange={(v) => setTweak('accent', v)} />
      )}
      <TweakSlider label="Tamanho do texto" value={t.textSize} min={15} max={19} unit="px"
                   onChange={(v) => setTweak('textSize', v)} />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById('tweaks-root')).render(<TweaksApp />);
