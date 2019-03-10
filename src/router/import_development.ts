// export default (file: string) => () => import(`@/views/${file}`);

export default (file: string) => (resolve: any) => require([`@/views/${file}`], resolve);
