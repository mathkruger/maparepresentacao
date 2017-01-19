function setCookie(name, value, expires) {
  var curCookie = name + "=" + escape(value) +
  ((expires) ? "; expires=" + expires.toGMTString() : "");
  document.cookie = curCookie;
}

function getCookie(name) {
  var dc = document.cookie;
  var prefix = name + "=";
  var begin = dc.indexOf("; " + prefix);
  
  if (begin == -1) {
    begin = dc.indexOf(prefix);
    
    if (begin != 0)
      return null;
  } 
  else
    begin += 2;
  
  var end = document.cookie.indexOf(";", begin);
  
  if (end == -1)
    end = dc.length;
  
  return unescape(dc.substring(begin + prefix.length, end));
}

function deleteCookie(name) {
  if (getCookie(name)) {
    document.cookie = name + "=" + 
    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    history.go(0);
  }
}

var app = angular.module('reprApp',[]);

app.controller('reprController', function($scope,$http){
  $scope.representantes = [];
  $scope.estados = [];
  $scope.representante = null;
  $scope.estado = null;

  var url_base = "http://localhost/mapa/api/";

  $scope.verificaLogin = function(){
    console.log(getCookie('usuario'));

    if(getCookie('usuario') == null){
      window.location = "index.html";
    }
  };

  $scope.removerLogin = function(){
    deleteCookie('usuario');
    console.log(document.cookie);
    $scope.verificaLogin();
  };

  $scope.carregaRepresentantes = function(sigla){
    $scope.verificaLogin();

    getEstado(sigla);
    getRepresentantesEstado(sigla);
  };

  $scope.carregaEstados = function(){
    $scope.verificaLogin();
    getEstados();
  };

  $scope.editarRepresentante = function(r){
    $scope.verificaLogin();

    $scope.representante = {};

    $scope.representante.COD = r.COD;
    $scope.representante.NOME = r.NOME;
    $scope.representante.TELEFONE = r.TELEFONE;
    $scope.representante.EMAIL = r.EMAIL;
    $scope.representante.ATUACAO = r.ATUACAO;
    $scope.representante.ESTADO = r.ESTADO;
  };

  $scope.alteraResponsavel = function(estado){
    $scope.verificaLogin();

    $http.post(url_base + "estados", estado)
    .success(function(){
      console.log("Alterou responsavel");
      getEstado(estado.SIGLA);
    })
    .error(function(err){
      console.error("Erro: " + err);
    })
  };

  getEstado = function(s){
    $http.get(url_base + "estados/" + s)
    .success(function(data){
      console.log('Carregou o estado');
      $scope.estado = data[0];
    })
    .error(function(err){
      console.error('Erro: ' + err);
    });
  };

  getEstados = function(){
    $http.get(url_base + "estados")
    .success(function(data){
      $scope.estados = data;
    })
    .error(function(err){
      console.error(err);
    })
  };

  getRepresentantesEstado = function(s){
    $http.get(url_base + "representantes/estado/" + s)
    .success(function(data){
      console.log('Carregou os representantes');
      $scope.representantes = data;
    })
    .error(function(err){
      console.error('Erro: ' + err);
    });
  };

  $scope.salvaRepresentante = function(r){
    $scope.verificaLogin();

    if(r.COD === undefined) {
      r.COD = 0;
    }

    $http.post(url_base + "representantes",r)
    .success(function(){
      console.log('Representante cadastrado com sucesso!');

      getRepresentantesEstado(r.ESTADO);
      $scope.representante = {ESTADO: $scope.estado.SIGLA};

      BootstrapDialog.alert({
        title: "Atenção!",
        message: "O representante foi salvo com sucesso!",
        type: BootstrapDialog.TYPE_SUCCESS,
        closable: true,
        buttonLabel: 'Fechar'
      });
    })
    .error(function(err){
      console.error("Erro ao salvar o representante: " + err);
      
      BootstrapDialog.alert({
        title: "Atenção!",
        message: "Houve um erro ao cadastrar o Representante!<br>Erro: " + err,
        type: BootstrapDialog.TYPE_ERROR,
        closable: true,
        buttonLabel: 'Fechar'
      });
    });
  };

  $scope.confirmaExclusaoRepresentante = function(r){
    $scope.verificaLogin();


    var dialog = new BootstrapDialog.show({
      title: 'Confirmação da Exclusão',
      message: 'Atenção! Confirma a exclusão do representante <strong>' + r.NOME + '</strong>?<br> Esta operação não poderá ser desfeita!',
      buttons: [{
        icon: 'glyphicon glyphicon-ban-circle',
        label: '(N)ão',
        cssClass: 'btn-info',
        hotkey: 78, // Código da tecla para o N (ASCII=78)
        action: function () {
          dialog.close();
        }
      },{
        icon: 'glyphicon glyphicon-ok-circle',
        label: '(S)im',
        cssClass: 'btn-danger',
        hotkey: 83, // Código da tecla para o S (ASCII=83)
        action: function () {
          apagaRepresentante(r);
          dialog.close();
        }
      }]
    });
  };

  apagaRepresentante = function(r){
    $http.delete(url_base + "representantes/" + r.COD)
    .success(function(){
      BootstrapDialog.alert({
        title: "Atenção!",
        message: "O representante foi removido com sucesso!",
        type: BootstrapDialog.TYPE_SUCCESS,
        closable: true,
        buttonLabel: 'Fechar'
      });

      getRepresentantesEstado(r.ESTADO);

    })
    .error(function(err){
      console.error("Erro: " + err);

      BootstrapDialog.alert({
        title: "Atenção!",
        message: "Houve um erro ao remover o Representante!<br>Erro: " + err,
        type: BootstrapDialog.TYPE_ERROR,
        closable: true,
        buttonLabel: 'Fechar'
      });
    })
  };
});

app.controller('loginController', function($scope,$http){
  $scope.usuario = {};
  var url_base = "http://localhost/mapa/api/login";

  $scope.verificaLogin = function(){
    console.log(getCookie('usuario'));

    if(getCookie('usuario') != null){
      window.location = "app.html";
    }
  };

  $scope.validaLogin = function(u){
    $http.get(url_base + "/" + u.LOGIN + "/" + u.SENHA)
    .success(function(data){
      var dataExpiracao = new Date();
      dataExpiracao.setMinutes(dataExpiracao.getMinutes() + 30);

      if(data == 'true'){
        setCookie('usuario',u.LOGIN,dataExpiracao);

        console.log(document.cookie);
        window.location = "app.html";
      }
      else{
        BootstrapDialog.alert({
          title: "Atenção!",
          message: "Login e/ou senha incorretos!",
          type: BootstrapDialog.TYPE_WARNING,
          closable: true,
          buttonLabel: 'Fechar'
        });
      }
    })
    .error(function(err){
      BootstrapDialog.alert({
        title: "Atenção!",
        message: "Houve um erro ao logar<br>Erro: " + err,
        type: BootstrapDialog.TYPE_ERROR,
        closable: true,
        buttonLabel: 'Fechar'
      });
    });
  }
});


