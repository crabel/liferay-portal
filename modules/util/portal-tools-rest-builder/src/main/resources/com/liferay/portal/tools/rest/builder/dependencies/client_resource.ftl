package ${configYAML.apiPackagePath}.client.resource.${escapedVersion};

<#list globalEnumSchemas?keys as globalEnumSchemaName>
	import ${configYAML.apiPackagePath}.client.constant.${escapedVersion}.${globalEnumSchemaName};
</#list>

import ${configYAML.apiPackagePath}.client.dto.${escapedVersion}.${schemaName};
import ${configYAML.apiPackagePath}.client.http.HttpInvoker;
import ${configYAML.apiPackagePath}.client.pagination.Page;
import ${configYAML.apiPackagePath}.client.pagination.Pagination;
import ${configYAML.apiPackagePath}.client.serdes.${escapedVersion}.${schemaName}SerDes;

import java.io.File;

import java.util.Locale;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

import javax.annotation.Generated;

/**
 * @author ${configYAML.author}
 * @generated
 */
@Generated("")
public interface ${schemaName}Resource {

	public static Builder builder() {
		return new Builder();
	}

	<#list freeMarkerTool.getResourceTestCaseJavaMethodSignatures(configYAML, openAPIYAML, schemaName) as javaMethodSignature>
		<#assign
			parameters = freeMarkerTool.getResourceTestCaseParameters(javaMethodSignature.javaMethodParameters, javaMethodSignature.operation, false)?replace(".constant.", ".client.constant.")?replace(".dto.", ".client.dto.")?replace("com.liferay.portal.kernel.search.filter.Filter filter", "String filterString")?replace("com.liferay.portal.kernel.search.Sort[] sorts", "String sortString")?replace("com.liferay.portal.vulcan.multipart.MultipartBody multipartBody", "${schemaName} ${schemaVarName}, Map<String, File> multipartFiles")?replace("com.liferay.portal.vulcan.pagination", "${configYAML.apiPackagePath}.client.pagination")
		/>

		public ${javaMethodSignature.returnType?replace(".constant.", ".client.constant.")?replace(".dto.", ".client.dto.")?replace("com.liferay.portal.vulcan.pagination.", "")?replace("javax.ws.rs.core.Response", "void")} ${javaMethodSignature.methodName}(${parameters}) throws Exception;

		public HttpInvoker.HttpResponse ${javaMethodSignature.methodName}HttpResponse(${parameters}) throws Exception;
	</#list>

	public static class Builder {

		public Builder authentication(String login, String password) {
			_login = login;
			_password = password;

			return this;
		}

		public ${schemaName}Resource build() {
			return new ${schemaName}ResourceImpl(this);
		}

		public Builder endpoint(String host, int port, String scheme) {
			_host = host;
			_port = port;
			_scheme = scheme;

			return this;
		}

		public Builder locale(Locale locale) {
			_locale = locale;

			return this;
		}

		private Builder() {
		}

		private String _host = "localhost";
		private Locale _locale;
		private String _login = "test@liferay.com";
		private String _password = "test";
		private int _port = 8080;
		private String _scheme = "http";

	}

	public static class ${schemaName}ResourceImpl implements ${schemaName}Resource {

		<#list freeMarkerTool.getResourceTestCaseJavaMethodSignatures(configYAML, openAPIYAML, schemaName) as javaMethodSignature>
			<#assign
				arguments = freeMarkerTool.getResourceTestCaseArguments(javaMethodSignature.javaMethodParameters)?replace("filter", "filterString")?replace("sorts", "sortString")?replace("multipartBody", "${schemaVarName}, multipartFiles")
				parameters = freeMarkerTool.getResourceTestCaseParameters(javaMethodSignature.javaMethodParameters, javaMethodSignature.operation, false)?replace(".constant.", ".client.constant.")?replace(".dto.", ".client.dto.")?replace("com.liferay.portal.kernel.search.filter.Filter filter", "String filterString")?replace("com.liferay.portal.kernel.search.Sort[] sorts", "String sortString")?replace("com.liferay.portal.vulcan.multipart.MultipartBody multipartBody", "${schemaName} ${schemaVarName}, Map<String, File> multipartFiles")?replace("com.liferay.portal.vulcan.pagination", "${configYAML.apiPackagePath}.client.pagination")
			/>

			public ${javaMethodSignature.returnType?replace(".constant.", ".client.constant.")?replace(".dto.", ".client.dto.")?replace("com.liferay.portal.vulcan.pagination.", "")?replace("javax.ws.rs.core.Response", "void")} ${javaMethodSignature.methodName}(${parameters}) throws Exception {
				HttpInvoker.HttpResponse httpResponse = ${javaMethodSignature.methodName}HttpResponse(${arguments});

				String content = httpResponse.getContent();

				_logger.fine("HTTP response content: " + content);

				_logger.fine("HTTP response message: " + httpResponse.getMessage());
				_logger.fine("HTTP response status code: " + httpResponse.getStatusCode());

				<#if !javaMethodSignature.returnType?contains("javax.ws.rs.core.Response")>
					<#if javaMethodSignature.returnType?contains("Page<")>
						return Page.of(content, ${schemaName}SerDes::toDTO);
					<#elseif javaMethodSignature.returnType?ends_with("String")>
						return content;
					<#elseif !stringUtil.equals(javaMethodSignature.returnType, "void")>
						try {
							return ${javaMethodSignature.returnType?replace(".dto.", ".client.serdes.")}SerDes.toDTO(content);
						}
						catch (Exception e) {
							_logger.log(Level.WARNING, "Unable to process HTTP response: " + content, e);

							throw e;
						}
					</#if>
				</#if>
			}

			public HttpInvoker.HttpResponse ${javaMethodSignature.methodName}HttpResponse(${parameters}) throws Exception {
				HttpInvoker httpInvoker = HttpInvoker.newHttpInvoker();

				<#if freeMarkerTool.hasHTTPMethod(javaMethodSignature, "patch", "post", "put")>
					<#if freeMarkerTool.hasRequestBodyMediaType(javaMethodSignature, "multipart/form-data")>
						httpInvoker.multipart();

						httpInvoker.part("${schemaVarName}", ${schemaName}SerDes.toJSON(${schemaVarName}));

						for (Map.Entry<String, File> entry : multipartFiles.entrySet()) {
							httpInvoker.part(entry.getKey(), entry.getValue());
						}
					<#else>
						httpInvoker.body(

						<#list javaMethodSignature.javaMethodParameters as javaMethodParameter>
							<#if javaMethodParameter?is_last>
								${javaMethodParameter.parameterName}.toString()
							</#if>
						</#list>

						, "application/json");
					</#if>
				</#if>

				if (_builder._locale != null) {
					httpInvoker.header("Accept-Language", _builder._locale.toLanguageTag());
				}

				httpInvoker.httpMethod(HttpInvoker.HttpMethod.${freeMarkerTool.getHTTPMethod(javaMethodSignature.operation)?upper_case});

				<#list javaMethodSignature.javaMethodParameters as javaMethodParameter>
					<#if stringUtil.equals(javaMethodParameter.parameterName, "filter")>
						if (filterString != null) {
							httpInvoker.parameter("filter", filterString);
						}
					<#elseif stringUtil.equals(javaMethodParameter.parameterName, "pagination")>
						if (pagination != null) {
							httpInvoker.parameter("page", String.valueOf(pagination.getPage()));
							httpInvoker.parameter("pageSize", String.valueOf(pagination.getPageSize()));
						}
					<#elseif stringUtil.equals(javaMethodParameter.parameterName, "sorts")>
						if (sortString != null) {
							httpInvoker.parameter("sort", sortString);
						}
					<#elseif freeMarkerTool.isQueryParameter(javaMethodParameter, javaMethodSignature.operation)>
						if (${javaMethodParameter.parameterName} != null) {
							<#if stringUtil.startsWith(javaMethodParameter.parameterType, "[")>
								for (int i = 0; i < ${javaMethodParameter.parameterName}.length; i++) {
									httpInvoker.parameter("${javaMethodParameter.parameterName}", String.valueOf(${javaMethodParameter.parameterName}[i]));
								}
							<#else>
								httpInvoker.parameter("${javaMethodParameter.parameterName}", String.valueOf(${javaMethodParameter.parameterName}));
							</#if>
						}
					</#if>
				</#list>

				httpInvoker.path(_builder._scheme + "://" + _builder._host + ":" + _builder._port + "/o${configYAML.application.baseURI}/${openAPIYAML.info.version}${javaMethodSignature.path}"

				<#list javaMethodSignature.pathJavaMethodParameters as javaMethodParameter>
					, ${javaMethodParameter.parameterName}
				</#list>

				);

				httpInvoker.userNameAndPassword(_builder._login + ":" + _builder._password);

				return httpInvoker.invoke();
			}
		</#list>

		private ${schemaName}ResourceImpl(Builder builder) {
			_builder = builder;
		}

		private static final Logger _logger = Logger.getLogger(${schemaName}Resource.class.getName());

		private Builder _builder;

	}

}