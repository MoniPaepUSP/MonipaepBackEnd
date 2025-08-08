<h1  align="center">Back-End MoniPaEp</h1>

<h2  align="center">
Implementação da base de dados para o aplicativo MonipaEp e seu sistema web de gerenciamento de pacientes.
</h2>


![](https://github.com/vinicius-claus/IC-MoniPaEp-Backend/blob/production/bd.png)

## Como executar

### Requisitos

Ter instalado:
- `Docker`
- `Yarn`
- `psql`

### Passos

- Fazer um clone do projeto para o seu computador com:
  ```
  git clone https://github.com/MoniPaepUSP/MonipaepBackEnd/tree/main
  ```
- Renomeie `.env.example` para `.env`.

#### Para rodar em desenvolvimento
- Rode o projeto com: `docker compose up -d` (`-d` para rodar em segundo plano)
- (Na primeira vez) rode as migrations que existem no projeto: `npm run migration:run`
- (Na primeira vez) Insira os dados de exemplo: `npm run populate` (insira a senha)
- Caso queira terminar, rode: `docker compose down`
  
#### Para rodar em produção

O projeto está configurado para rodar em produção com docker compose. Ele é configurado para rodar na porta 3000, e usamos o **nginx** para fazer o **proxy reverso**. Os comandos úteis na produção são:

Siga os passos:
- `docker compose -f docker-compose.prod.yaml build` para buildar o projeto (ele criará uma imagem nova do projeto). Tome cuidado pois ele não deleta a imagem antiga, então você terá que deletar manualmente.
- `docker compose -f docker-compose.prod.yaml up -d` para rodar o projeto em produção.
- Rode as migrations com: `docker compose exec app npm run migration:run:prod`
- Insira os dados iniciais com `docker compose exec -T postgres psql -U postgres -d monipaep < ./src/database/populate/populate_db.sql`
- `docker compose -f docker-compose.prod.yaml down` para terminar o projeto.

#### Para gerar migrations:
- `npm run migration:generate` (desenvolvimento)

## Tecnologias utilizadas

<ul>
	<li>NodeJS
	<li>Linguagem de programação: Typescript
	<li>Base de Dados: PostgreeSQL
	<li>ORM utilizado: TypeORM
	<li>Tipo de commit utilizado: Commitizen
</ul>

## Padrão Commitizen

- `feat`: adiciona ou remove novas funcionalidades.
- `fix`: corrige algum bug.
- `refactor`: commits que reescrevem ou reestruturam o código, porém não alteram o comportamento da aplicação.
- `perf`: direcionados para melhoria de desempenho.
- `style`: mudanças no código que não afetam o seu comportamento (ponto e vírgula, espaço em branco, formatação).
- `test`: adiciona ou corrige testes existentes.
- `docs`: commits que afetam apenas a documentação.
- `build`: afeta apenas os componentes de construção (ferramentas, dependências, versão do projeto...).
- `ci`: afeta apenas os componentes de configuração do CI, arquivos ou scripts (Travis, Circle, BrowserStack, SauceLabs)
- `chore`: outras mudanças que não afetam o source ou arquivos de teste.
