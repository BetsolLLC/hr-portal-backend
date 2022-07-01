-- public.users table
CREATE TABLE public.users (
    id bigserial NOT NULL,
    "name" text NOT NULL,
    email text NOT NULL,
    phone_number varchar(10) NOT NULL,
    batch smallint NOT NULL,
    password varchar(255) NOT null,
    uploaded_pre_on_board_docs bool NULL DEFAULT false,
    uploaded_on_board_docs bool NULL DEFAULT false,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT un_users UNIQUE (email)
);
CREATE INDEX idx_users_email ON public.users (email);
-- ALTER TABLE public.users ALTER COLUMN uploaded_pre_on_board_docs SET DEFAULT false;
-- ALTER TABLE public.users ALTER COLUMN uploaded_on_board_docs SET DEFAULT false;
-- public.doc_type table
CREATE TABLE public.doc_type (
    id smallint NOT NULL,
    doc_type_name varchar NOT NULL,
    total smallint NOT NULL,
    CONSTRAINT doc_type_pk PRIMARY KEY (id),
    CONSTRAINT doc_type_un UNIQUE (doc_type_name)
);
CREATE INDEX doc_type_name_idx ON public.doc_type (doc_type_name);
-- public.all_docs table
CREATE TABLE public.all_docs (
    id int4 NOT NULL,
    doc_name varchar NOT NULL,
    doc_type_id smallint NOT NULL,
    is_signature_required bool NOT NULL DEFAULT false,
    CONSTRAINT all_docs_pk PRIMARY KEY (id),
    CONSTRAINT all_docs_un UNIQUE (doc_name),
    CONSTRAINT all_docs_fk FOREIGN KEY (doc_type_id) REFERENCES public.doc_type(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX all_docs_doc_name_idx ON public.all_docs (doc_name);
-- ALTER TABLE public.all_docs ADD is_signature_required bool NOT NULL DEFAULT false;
-- public.uploaded_docs table
CREATE TABLE public.uploaded_docs (
    user_id bigserial NOT NULL,
    all_docs_id int4 NOT NULL,
    doc_ref text NOT NULL,
    CONSTRAINT uploaded_docs_pk PRIMARY KEY (user_id,all_docs_id),
    CONSTRAINT uploaded_docs_fk FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT uploaded_docs_fk_1 FOREIGN KEY (all_docs_id) REFERENCES public.all_docs(id) ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX uploaded_docs_user_id_idx ON public.uploaded_docs (user_id);
-- SEED data for public.doc_type
INSERT INTO public.doc_type (id,doc_type_name,total) VALUES (1,'pre_on_boarding',10);
INSERT INTO public.doc_type (id,doc_type_name,total) VALUES (2,'on_boarding', 11);
-- SEED data for public.all_docs
INSERT INTO public.all_docs (id,doc_name,doc_type_id, is_signature_required) VALUES (1,'PAN card',2, false);
INSERT INTO public.all_docs (id,doc_name,doc_type_id,is_signature_required) VALUES (2,'PF form',1,true);
INSERT INTO public.all_docs (id,doc_name,doc_type_id, is_signature_required) VALUES (3,'Medical Insurance ',1, false);