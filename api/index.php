<?php

/*
 * PROJETO REST EM PHP
 * Para funcionar é necessário habilitar o mod_rewrite no Apache
 * sudo a2enmod rewrite
 * sudo service apache2 restart
 * Editar o arquivo de configuração e inserir
 * sudo nano /etc/apache2/apache2.conf
 * <Directory "/var/www/html">
  Options FollowSymlinks
  AllowOverride All
  Order allow,deny
  Allow from all
  </Directory>
 *  */

//definido as variáveis para conexão ao SGBD
$db_host = 'localhost';
$db_name = 'representante';
$db_user = 'root';
$db_password = 'math2569';

// Carregando a lib Fat Free do PHP
$f3 = require('lib/base.php');
//Atribuimos que estamos em modo desenvolvimento. O modo produção é 0
$f3->set('DEBUG', 1);
//Conectando ao MySQL
$f3->set('DB', $db = new DB\SQL(
        "mysql:host=$db_host;port=3306;dbname=$db_name", $db_user, $db_password, array(\PDO::ATTR_ERRMODE => \PDO::ERRMODE_EXCEPTION)));
/*
 * Definição das rotas REST da nossa aplicação
 *  */
$f3->route('GET /', 'inicio');

function inicio() {
    echo 'STRICT';
}

/* REST REPRESENTANTES */
$f3->route('GET /representantes/estado/@sigla', 'getRepresentantesEstado');
$f3->route('GET /representantes/@id', 'getRepresentante');
$f3->route('POST /representantes', 'salvaRepresentante');
$f3->route('DELETE /representantes/@id', 'apagaRepresentante');

/* REST ESTADOS */
$f3->route('GET /estados', 'getEstados');
$f3->route('GET /estados/@sigla', 'getEstado');
$f3->route('POST /estados', 'salvaEstado');

/* REST USUARIOS */
$f3->route('GET /login/@usuario/@senha', 'getLogin');

$f3->run();

function getRepresentantesEstado($f3) {
    $id = $f3->get('PARAMS.sigla');

    $sql = "SELECT * FROM TB_Representantes WHERE ESTADO = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, array(1 => $id)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function getRepresentante($f3) {
    $id = $f3->get('PARAMS.id');
    $sql = "SELECT * FROM TB_Representantes WHERE COD = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, array(1 => $id)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}


function apagaRepresentante($f3) {
    $id = $f3->get('PARAMS.id');
    $sql = "DELETE FROM TB_Representantes WHERE COD = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, $id));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}


function salvaRepresentante($f3) {
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json);

    $sql_insert = "INSERT INTO TB_Representantes (NOME, TELEFONE, EMAIL, ESTADO, ATUACAO) VALUES (?,?,?,?,?)";
    $sql_update = "UPDATE TB_Representantes SET NOME = ?, TELEFONE = ?, EMAIL = ?, ESTADO = ?, ATUACAO = ? WHERE COD = ?";

    try {
        if ($obj->COD != 0) {

            $f3->set('dados', $f3->get('DB')->exec($sql_update, array(1 => $obj->NOME, 2 => $obj->TELEFONE, 3 => $obj->EMAIL, 4 => $obj->ESTADO, 5 => $obj->ATUACAO, 6 => $obj->COD)));

        }
        else{
            $f3->set('dados', $f3->get('DB')->exec($sql_insert, array(1 => $obj->NOME, 2 => $obj->TELEFONE, 3 => $obj->EMAIL, 4 => $obj->ESTADO, 5 => $obj->ATUACAO)));
        }
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function getEstados($f3){
    $sql = "SELECT * FROM TB_Estados";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function getEstado($f3){
    $sigla = $f3->get('PARAMS.sigla');
    $sql = "SELECT * FROM TB_Estados WHERE SIGLA = ?";
    try {
        $f3->set('dados', $f3->get('DB')->exec($sql, array(1 => $sigla)));
        echo json_encode($f3->get('dados'));
    } catch (PDOException $e) {
        http_response_code(500);
        die($e->getMessage());
    }
}

function salvaEstado($f3){
    $json = file_get_contents('php://input', true);
    $obj = json_decode($json);

    $sql = "UPDATE TB_Estados SET RESPONSAVEL = ? WHERE SIGLA = ?";

    try{
        $f3->set('dados', $f3->get('DB')->exec($sql, array(1 => $obj->RESPONSAVEL, 2 => $obj->SIGLA)));
        echo json_encode($f3->get('dados'));
    }catch(PDOException $e){
        http_response_code(500);
        die($e->getMessage());
    }
}


function getLogin($f3) {
    $loginValido = false;
    $usuario = $f3->get('PARAMS.usuario');
    $senha = $f3->get('PARAMS.senha');
    $sql = "select * FROM TB_Users where LOGIN=? AND md5(?)=SENHA";    
    //iremos contar o número de registros retornados no count...
    $f3->set('dados', count($f3->get('DB')->exec($sql, array(1 => $usuario, 2 => $senha))));
    //Se o número for igual a 1, o usuario e a senha são válidos!
    if ($f3->get('dados') == 1) {
        $loginValido = true;
    }
    echo json_encode($loginValido);
}