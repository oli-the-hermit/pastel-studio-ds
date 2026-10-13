import React from 'react';
import { Link } from 'react-router';
import { Button, IconButton, IconPlus, IconStar, TextButton } from '@pastel-studio/react';
import { Example } from '../blocks/Example';
import { OnSurface } from '../blocks/OnSurface';
import { Callout, Code, Page, Section } from '../blocks/Page';
import { componentPath } from '../components';

export function UsingComponents() {
  return (
    <Page
      overline="Start"
      title="Using components"
      lead="Every component follows the same few rules. Learn them once, on the buttons, and they hold for everything else."
    >
      <Section title="Import and render">
        <p>
          Import the styles once, as <Link to="/getting-started">Getting started</Link> describes, then import components
          by name from <Code>@pastel-studio/react</Code>: <Code>{"import { Button } from '@pastel-studio/react'"}</Code>.
          There is nothing to configure and no provider to add.
        </p>
        <Example>
          <div className="docs-demo-row">
            <Button variant="primary" icon={<IconPlus />}>Add task</Button>
            <Button>Cancel</Button>
            <TextButton>Skip for now</TextButton>
            <IconButton label="Star"><IconStar /></IconButton>
          </div>
        </Example>
        <p className="docs-note">
          Above: <Code>{'<Button variant="primary">'}</Code>, <Code>{'<Button>'}</Code>, <Code>{'<TextButton>'}</Code> and <Code>{'<IconButton label="Star">'}</Code>.
        </p>
      </Section>

      <Section title="What every component accepts">
        <ul className="docs-list">
          <li><Code>className</Code> is added after the component's own classes, so your styles can reach it.</li>
          <li><Code>ref</Code> points to the real element, for focus, measuring or anchoring a popover.</li>
          <li>Any other HTML attribute goes to that element too: <Code>id</Code>, <Code>aria-*</Code>, <Code>data-*</Code>, event handlers. Each component's page says which element that is.</li>
          <li>Buttons are <Code>type="button"</Code> unless you ask for <Code>type="submit"</Code>, so they never submit a form by accident.</li>
        </ul>
      </Section>

      <Section title="States come from props">
        <p>
          A component never keeps a look you can't ask for. Disabled, active, busy, failed: each is a prop, so you can show any
          state from your own data, and every state appears on the component's page.
        </p>
        <p>
          A component that holds a value is controlled: you pass <Code>value</Code> and <Code>onChange</Code>, and it shows what you pass.
          When you don't need to track the value yourself, pass <Code>defaultValue</Code> and let it keep its own.
        </p>
      </Section>

      <Section title="Surfaces" description="Screens are built from tonal surfaces instead of borders, so a control has to stay visible on whichever one it sits on.">
        <p>
          Controls assume they sit on a card, surface 1. Anywhere else, tell them with <Code>surface</Code>: <Code>0</Code> for the page,
          {' '}<Code>2</Code> or <Code>3</Code> for raised rows and panels, <Code>"accent"</Code> for an accent fill. The fill and the hover then stay one step above.
        </p>
        <Example>
          <div className="docs-demo-row">
            <OnSurface surface={0}><Button surface={0}>On the page</Button></OnSurface>
            <Button>On a card</Button>
            <OnSurface surface={2}><Button surface={2}>On surface 2</Button></OnSurface>
            <OnSurface surface={3}><Button surface={3}>On surface 3</Button></OnSurface>
            <OnSurface surface="accent"><Button variant="primary" surface="accent">On accent</Button></OnSurface>
          </div>
        </Example>
      </Section>

      <Section title="Words and translation">
        <p>There are two kinds of text in a component.</p>
        <ul className="docs-list">
          <li><strong>Words you pass</strong>, like a button's text or an icon button's <Code>label</Code>. They come from your app, in your app's language.</li>
          <li>
            <strong>Words a component brings</strong>, like the "Close" of a dialog. They live in one shared list, so each is translated once.
            Wrap your app in <Code>LabelsProvider</Code> and pass the words to replace: <Code>{'<LabelsProvider labels={{ close: "Cerrar" }}>'}</Code>.
            A component's own <Code>labels</Code> prop does the same for one instance.
          </li>
        </ul>
        <Callout title="The list is empty for now">
          The three buttons bring no words of their own. The shared list fills as components with built-in text arrive, and each
          component's page lists the words it uses.
        </Callout>
      </Section>

      <Section title="Theming through tokens">
        <ul className="docs-list">
          <li>Components are styled only with tokens. Change a role in a theme, like <Code>--ps-accent</Code>, and every component follows. See <Link to="/foundations/color">Color</Link>.</li>
          <li>
            Some components add tokens of their own, like <Code>--ps-button-fill</Code>. Set one on the component, or on anything around it,
            to restyle it there. Each page lists them under Tokens used.
          </li>
          <li>For anything else, write your own CSS against <Code>className</Code>. Pastel Studio sits in the <Code>ps</Code> cascade layer, so your rules win without <Code>!important</Code>.</li>
        </ul>
      </Section>

      <Section title="Where to go next">
        <p>
          Each component has a page with a live demo, every state, its props, the tokens it uses, its keys and when to use it.
          Start with <Link to={componentPath('button')}>Button</Link>.
        </p>
      </Section>
    </Page>
  );
}
