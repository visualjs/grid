// import { VNode } from "./internal";

declare namespace JSX {

    export interface Component<P> { }

    export interface FunctionComponent<P = {}> {
        (props: P): VNode<any> | null;
    }

    export interface ComponentClass<P = {}> {
        new(props: P): Component<P>;
    }

    export type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

    export type RefCallback<T> = (instance: T | null) => void;

    export interface VNode<P = {}> {
        type: ComponentType<P> | string;
        props: P & { children: ComponentChildren };
        key?: any;
        ref?: RefCallback<any>;
    }

    export type ComponentChild =
        | VNode<any>
        | object
        | string
        | number
        | bigint
        | boolean
        | null
        | undefined;
    export type ComponentChildren = ComponentChild[] | ComponentChild;

    interface Element extends VNode<any> { }

    interface ElementClass extends Component<any> { }

    export interface ClassAttributes<T> {
        ref?: RefCallback<any>;
    }

    interface ElementAttributesProperty {
        props: any;
    }

    type DOMCSSProperties = {
        [key in keyof Omit<
            CSSStyleDeclaration,
            | 'item'
            | 'setProperty'
            | 'removeProperty'
            | 'getPropertyValue'
            | 'getPropertyPriority'
        >]?: string | number | null | undefined;
    };

    type AllCSSProperties = {
        [key: string]: string | number | null | undefined;
    };

    interface CSSProperties extends AllCSSProperties, DOMCSSProperties {
        cssText?: string | null;
    }

    interface HTMLAttributes<RefType extends EventTarget = EventTarget>
        extends ClassAttributes<RefType> {
        // Standard HTML Attributes
        accept?: string;
        acceptCharset?: string;
        accessKey?: string;
        action?: string;
        allow?: string;
        allowFullScreen?: boolean;
        allowTransparency?: boolean;
        alt?: string;
        as?: string;
        async?: boolean;
        autocomplete?: string;
        autoComplete?: string;
        autocorrect?: string;
        autoCorrect?: string;
        autofocus?: boolean;
        autoFocus?: boolean;
        autoPlay?: boolean;
        capture?: boolean | string;
        cellPadding?: number | string;
        cellSpacing?: number | string;
        charSet?: string;
        challenge?: string;
        checked?: boolean;
        cite?: string;
        class?: string;
        className?: string | string[] | Record<string, boolean>;
        cols?: number;
        colSpan?: number;
        content?: string;
        contentEditable?: boolean;
        contextMenu?: string;
        controls?: boolean;
        controlsList?: string;
        coords?: string;
        crossOrigin?: string;
        data?: string;
        dateTime?: string;
        default?: boolean;
        defer?: boolean;
        dir?: 'auto' | 'rtl' | 'ltr';
        disabled?: boolean;
        disableRemotePlayback?: boolean;
        download?: any;
        decoding?: 'sync' | 'async' | 'auto';
        draggable?: boolean;
        encType?: string;
        enterkeyhint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: string;
        formNoValidate?: boolean;
        formTarget?: string;
        frameBorder?: number | string;
        headers?: string;
        height?: number | string;
        hidden?: boolean;
        high?: number;
        href?: string;
        hrefLang?: string;
        for?: string;
        htmlFor?: string;
        httpEquiv?: string;
        icon?: string;
        id?: string;
        inputMode?: string;
        integrity?: string;
        is?: string;
        keyParams?: string;
        keyType?: string;
        kind?: string;
        label?: string;
        lang?: string;
        list?: string;
        loading?: 'eager' | 'lazy';
        loop?: boolean;
        low?: number;
        manifest?: string;
        marginHeight?: number;
        marginWidth?: number;
        max?: number | string;
        maxLength?: number;
        media?: string;
        mediaGroup?: string;
        method?: string;
        min?: number | string;
        minLength?: number;
        multiple?: boolean;
        muted?: boolean;
        name?: string;
        nomodule?: boolean;
        nonce?: string;
        noValidate?: boolean;
        open?: boolean;
        optimum?: number;
        pattern?: string;
        ping?: string;
        placeholder?: string;
        playsInline?: boolean;
        poster?: string;
        preload?: string;
        radioGroup?: string;
        readonly?: boolean;
        readOnly?: boolean;
        referrerpolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
        rel?: string;
        required?: boolean;
        reversed?: boolean;
        role?: string;
        rows?: number;
        rowSpan?: number;
        sandbox?: string;
        scope?: string;
        scoped?: boolean;
        scrolling?: string;
        seamless?: boolean;
        selected?: boolean;
        shape?: string;
        size?: number;
        sizes?: string;
        slot?: string;
        span?: number;
        spellcheck?: boolean;
        spellCheck?: boolean;
        src?: string;
        srcset?: string;
        srcDoc?: string;
        srcLang?: string;
        srcSet?: string;
        start?: number;
        step?: number | string;
        style?: string | CSSProperties;
        summary?: string;
        tabIndex?: number;
        target?: string;
        title?: string;
        type?: string;
        useMap?: string;
        value?: string | string[] | number;
        volume?: string | number;
        width?: number | string;
        wmode?: string;
        wrap?: string;

        // Non-standard Attributes
        autocapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
        autoCapitalize?: 'off' | 'none' | 'on' | 'sentences' | 'words' | 'characters';
        disablePictureInPicture?: boolean;
        results?: number;
        translate?: 'yes' | 'no';

        // RDFa Attributes
        about?: string;
        datatype?: string;
        inlist?: any;
        prefix?: string;
        property?: string;
        resource?: string;
        typeof?: string;
        vocab?: string;

        // Microdata Attributes
        itemProp?: string;
        itemScope?: boolean;
        itemType?: string;
        itemID?: string;
        itemRef?: string;
    }

	interface IntrinsicAttributes {
		key?: any;
	}

    interface IntrinsicElements {
        // HTML
        a: HTMLAttributes<HTMLAnchorElement>;
        abbr: HTMLAttributes<HTMLElement>;
        address: HTMLAttributes<HTMLElement>;
        area: HTMLAttributes<HTMLAreaElement>;
        article: HTMLAttributes<HTMLElement>;
        aside: HTMLAttributes<HTMLElement>;
        audio: HTMLAttributes<HTMLAudioElement>;
        b: HTMLAttributes<HTMLElement>;
        base: HTMLAttributes<HTMLBaseElement>;
        bdi: HTMLAttributes<HTMLElement>;
        bdo: HTMLAttributes<HTMLElement>;
        big: HTMLAttributes<HTMLElement>;
        blockquote: HTMLAttributes<HTMLQuoteElement>;
        body: HTMLAttributes<HTMLBodyElement>;
        br: HTMLAttributes<HTMLBRElement>;
        button: HTMLAttributes<HTMLButtonElement>;
        canvas: HTMLAttributes<HTMLCanvasElement>;
        caption: HTMLAttributes<HTMLTableCaptionElement>;
        cite: HTMLAttributes<HTMLElement>;
        code: HTMLAttributes<HTMLElement>;
        col: HTMLAttributes<HTMLTableColElement>;
        colgroup: HTMLAttributes<HTMLTableColElement>;
        data: HTMLAttributes<HTMLDataElement>;
        datalist: HTMLAttributes<HTMLDataListElement>;
        dd: HTMLAttributes<HTMLElement>;
        del: HTMLAttributes<HTMLModElement>;
        details: HTMLAttributes<HTMLDetailsElement>;
        dfn: HTMLAttributes<HTMLElement>;
        dialog: HTMLAttributes<HTMLDialogElement>;
        div: HTMLAttributes<HTMLDivElement>;
        dl: HTMLAttributes<HTMLDListElement>;
        dt: HTMLAttributes<HTMLElement>;
        em: HTMLAttributes<HTMLElement>;
        embed: HTMLAttributes<HTMLEmbedElement>;
        fieldset: HTMLAttributes<HTMLFieldSetElement>;
        figcaption: HTMLAttributes<HTMLElement>;
        figure: HTMLAttributes<HTMLElement>;
        footer: HTMLAttributes<HTMLElement>;
        form: HTMLAttributes<HTMLFormElement>;
        h1: HTMLAttributes<HTMLHeadingElement>;
        h2: HTMLAttributes<HTMLHeadingElement>;
        h3: HTMLAttributes<HTMLHeadingElement>;
        h4: HTMLAttributes<HTMLHeadingElement>;
        h5: HTMLAttributes<HTMLHeadingElement>;
        h6: HTMLAttributes<HTMLHeadingElement>;
        head: HTMLAttributes<HTMLHeadElement>;
        header: HTMLAttributes<HTMLElement>;
        hgroup: HTMLAttributes<HTMLElement>;
        hr: HTMLAttributes<HTMLHRElement>;
        html: HTMLAttributes<HTMLHtmlElement>;
        i: HTMLAttributes<HTMLElement>;
        iframe: HTMLAttributes<HTMLIFrameElement>;
        img: HTMLAttributes<HTMLImageElement>;
        input: HTMLAttributes<HTMLInputElement>;
        ins: HTMLAttributes<HTMLModElement>;
        kbd: HTMLAttributes<HTMLElement>;
        keygen: HTMLAttributes<HTMLUnknownElement>;
        label: HTMLAttributes<HTMLLabelElement>;
        legend: HTMLAttributes<HTMLLegendElement>;
        li: HTMLAttributes<HTMLLIElement>;
        link: HTMLAttributes<HTMLLinkElement>;
        main: HTMLAttributes<HTMLElement>;
        map: HTMLAttributes<HTMLMapElement>;
        mark: HTMLAttributes<HTMLElement>;
        marquee: HTMLAttributes<HTMLMarqueeElement>;
        menu: HTMLAttributes<HTMLMenuElement>;
        menuitem: HTMLAttributes<HTMLUnknownElement>;
        meta: HTMLAttributes<HTMLMetaElement>;
        meter: HTMLAttributes<HTMLMeterElement>;
        nav: HTMLAttributes<HTMLElement>;
        noscript: HTMLAttributes<HTMLElement>;
        object: HTMLAttributes<HTMLObjectElement>;
        ol: HTMLAttributes<HTMLOListElement>;
        optgroup: HTMLAttributes<HTMLOptGroupElement>;
        option: HTMLAttributes<HTMLOptionElement>;
        output: HTMLAttributes<HTMLOutputElement>;
        p: HTMLAttributes<HTMLParagraphElement>;
        param: HTMLAttributes<HTMLParamElement>;
        picture: HTMLAttributes<HTMLPictureElement>;
        pre: HTMLAttributes<HTMLPreElement>;
        progress: HTMLAttributes<HTMLProgressElement>;
        q: HTMLAttributes<HTMLQuoteElement>;
        rp: HTMLAttributes<HTMLElement>;
        rt: HTMLAttributes<HTMLElement>;
        ruby: HTMLAttributes<HTMLElement>;
        s: HTMLAttributes<HTMLElement>;
        samp: HTMLAttributes<HTMLElement>;
        script: HTMLAttributes<HTMLScriptElement>;
        section: HTMLAttributes<HTMLElement>;
        select: HTMLAttributes<HTMLSelectElement>;
        slot: HTMLAttributes<HTMLSlotElement>;
        small: HTMLAttributes<HTMLElement>;
        source: HTMLAttributes<HTMLSourceElement>;
        span: HTMLAttributes<HTMLSpanElement>;
        strong: HTMLAttributes<HTMLElement>;
        style: HTMLAttributes<HTMLStyleElement>;
        sub: HTMLAttributes<HTMLElement>;
        summary: HTMLAttributes<HTMLElement>;
        sup: HTMLAttributes<HTMLElement>;
        table: HTMLAttributes<HTMLTableElement>;
        tbody: HTMLAttributes<HTMLTableSectionElement>;
        td: HTMLAttributes<HTMLTableCellElement>;
        textarea: HTMLAttributes<HTMLTextAreaElement>;
        tfoot: HTMLAttributes<HTMLTableSectionElement>;
        th: HTMLAttributes<HTMLTableCellElement>;
        thead: HTMLAttributes<HTMLTableSectionElement>;
        time: HTMLAttributes<HTMLTimeElement>;
        title: HTMLAttributes<HTMLTitleElement>;
        tr: HTMLAttributes<HTMLTableRowElement>;
        track: HTMLAttributes<HTMLTrackElement>;
        u: HTMLAttributes<HTMLElement>;
        ul: HTMLAttributes<HTMLUListElement>;
        var: HTMLAttributes<HTMLElement>;
        video: HTMLAttributes<HTMLVideoElement>;
        wbr: HTMLAttributes<HTMLElement>;
    }
}
