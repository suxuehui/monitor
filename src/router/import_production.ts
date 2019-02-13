export default (file: string) => () => import(`@/views/${file}`);
