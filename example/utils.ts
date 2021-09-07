
export function showContainer(id: string, title: string) {
    const container = document.querySelector<HTMLHeadElement>(id);
    const h3 = document.createElement('h3');
    h3.innerText = title;

    container.prepend(h3);
    container.style.display = 'block';
    return container;
}
