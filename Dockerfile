########################################
#Build application and its documentation
########################################
FROM node:16 as builder

COPY ./ /tmp/application

WORKDIR /tmp/application

RUN yarn install --frozen-lockfile && yarn build

RUN git config --global user.email "test@test.com" && git config --global user.name "No One" && git init . && touch .gitignore && git add .gitignore && git commit -m 'initialize repository'

ENTRYPOINT ["bash"]
#Build documentation
WORKDIR /tmp/application/docs-gen
RUN yarn && npx antora --fetch antora-playbook.yml
RUN rm -rf ./docs-gen/node_modules

############################
#Use distroless as end image
############################
FROM gcr.io/distroless/nodejs:16
COPY --from=builder /tmp/application /var/application

WORKDIR /var/application

EXPOSE 8080

ENTRYPOINT ["/nodejs/bin/node", "dist/api/src/main.js"]
