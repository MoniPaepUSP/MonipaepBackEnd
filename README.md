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

Ajeite os dados e siga os passos:
- Rode o projeto com: `docker compose up -d`
- Rode as migrations com: `docker compose exec app npm run migration:run`
- Insira os dados de exemplo com `docker compose exec -T postgres psql -U postgres -d monipaep < ./src/database/populate/populate_db.sql`
- Caso queira terminar, rode: `docker compose down`

#### Para rodar migrations:
- `npm run migration:generate` (desenvolvimento)
- `docker compose exec app npm run migration:generate` (produção)

<!-- ## 💬 Funcionalidades até o momento

<ul>

<li>Gerenciamento de permissões por meio de JWT e refresh tokens</li>

<li>Gerenciamento de Pacientes</li>

<li>Gerenciamento de funcionários</li>

<li>Gerenciamento de Sintomas</li>

<li>Gerenciamento de Doenças</li>

<li>Gerenciamento de Protocólos de Saúde</li>

<li>Gerenciamento de Unidades de Saúde</li>

<li>Gerenciamento de Perguntas Frequentes</li>

<li>Gerenciamento de Vacinas</li>

</ul> -->

  

## Tecnologias utilizadas

  

<ul>
	<li>Base de Dados: PostgreeSQL
	<li>Linguagem de programação: Typescript
	<li>ORM utilizado: TypeORM
	<li>NodeJS
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
